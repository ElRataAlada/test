import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, getDoc, updateDoc} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js";
import { Health } from "./health.js";

const app = initializeApp({
    apiKey: "AIzaSyAS2B9S-XjIVQcbx1GIYp81Clcu5wiUGgs",
    authDomain: "maksim-diplom.firebaseapp.com",
    projectId: "maksim-diplom",
    storageBucket: "maksim-diplom.appspot.com",
    messagingSenderId: "768171886362",
    appId: "1:768171886362:web:039072aa959b01fae64ea3"
});

const auth = getAuth(app);
const firestore = getFirestore(app);

export function isUserLoggined(user) { return user && Object.keys(user).length > 5 && auth.currentUser}
export async function authStateChanged(callback) { onAuthStateChanged(auth, await callback) }
export function logOut() { signOut(auth) }

let user = {}

const usersCollection = collection(firestore, 'users')

export async function writeUser(user){
    const now = new Date()
    now.setHours(0,0,0,0)

    if(now.getTime() - user.lastUpdate >= 1000*60*60*24){
        writeOldData(user, user.lastUpdate)
        
        user.water.current = 0
        user.cal.current = 0
    }

    user.lastUpdate = now.getTime()
    
    await setDoc(doc(usersCollection, `${user.id}`), user)
}

export async function writeOldData(user, date){    
    const history = user.history || {}

    history[`${date}`] = {
        cal: user.cal,
        water: user.water,
        weight: user.weight,
    }
    
    await updateDoc(doc(usersCollection, `${user.id}`), { ...user, history})
}

export async function getUser(id){
    const d = doc(firestore, 'users', `${id}`)
    const docRe = await getDoc(d)
    
    if(docRe.exists()) return docRe.data()
    else return null
}

let loginFormEmpty = true
let submitLoginButton = null

onAuthStateChanged(auth, async (u) => {
    if (u) {     
        user.photoURL = u.photoURL
        user.history = {}
        user.id = u.uid

        const firebaseResp = await getUser(user.id)
        
        user =  firebaseResp ? firebaseResp : user
        
        if(!isUserLoggined(user)) showLoginPopup(true)
        else writeUser(user)


        if (!loginFormEmpty) submitLoginButton.removeAttribute('disabled')

    } else { showLoginPopup(false) }
});


function showLoginPopup(enabled) {
    const inner = "<div class=\"popup\" id=\"auth-popup\"><form class=\"start-form\"><h2>Заповніть дані для продовження</h2><div class=\"start-form-wrapper\"><input type=\"text\" disabled required name=\"name\" id=\"name\" placeholder=\"Ім'я\"><input type=\"number\" disabled required name=\"age\" id=\"age\" placeholder=\"Вік\"><div class=\"sex-wrapper\"><label><input disabled checked value=\"male\" name=\"sex\" type=\"radio\"><p>Чоловік</p></label><label><input value=\"female\" disabled name=\"sex\" type=\"radio\"><p>Жінка</p></label></div><div class=\"mas-wrapper\"><input type=\"number\" disabled required name=\"height\" id=\"height\" placeholder=\"Зріст (см)\"><input type=\"number\" disabled required name=\"weight\" id=\"weight\" placeholder=\"Вага (кг)\"></div><div class=\"form-btns\"><button type=\"button\" id=\"google\" class=\"btn-google\"><img src=\"./img/ico/google.png\" alt=\"auth\"></button><button type=\"submit\" disabled class=\"btn-submit\">Продовжити</button></div></div></form></div>";

    document.body.innerHTML += inner
    
    const loginForm = document.querySelector('.start-form')
    submitLoginButton = document.querySelector('.btn-submit')

    if (enabled){
        loginForm.querySelector('#name').removeAttribute('disabled')
        loginForm.querySelector('#age').removeAttribute('disabled')
        loginForm.querySelector('#weight').removeAttribute('disabled')
        loginForm.querySelector('#height').removeAttribute('disabled')
        loginForm.querySelectorAll('input[name="sex"]').forEach(input => input.removeAttribute('disabled'))
    }

    loginForm.querySelectorAll('input').forEach(input => input.addEventListener('keyup', (e) => {
        loginFormEmpty = false

        loginForm.querySelectorAll('input').forEach(input => { if (input.value == '') loginFormEmpty = true })

        if (!loginFormEmpty && Object.keys(user).length != 0) submitLoginButton.removeAttribute('disabled')
        else submitLoginButton.setAttribute('disabled', '')
    }))

    submitLoginButton.addEventListener('click', async (e) => {
        e.preventDefault()

        let name = loginForm.querySelector('#name').value
        let age = loginForm.querySelector('#age').value
        let weight = loginForm.querySelector('#weight').value
        let height = loginForm.querySelector('#height').value
        let sex = loginForm.querySelector('input[name="sex"]:checked').value;

        if (name && age && weight && height && sex) {
            user.name = name
            user.age = +age
            user.height = +height
            user.sex = sex

            user.weight = { current: +weight, goal: 0, min: +weight, max: +weight }
            user = Health.setRecomendedWeight(user)
            user.weight.target = user.weight.recomended

            user.water = { current: 0, goal: 0 }
            user = Health.setRecomendedWater(user)
            user.water.target = user.water.recomended

            user.cal = { current: 0, goal: 0 }
            user = Health.setRecomendedCal(user)
            user.cal.target = user.cal.recomended

            await writeUser(user)

            window.location.reload()
        }
    })

    document.getElementById('google').addEventListener('click', async (e) => {
        e.preventDefault()

        await signInWithPopup(auth, new GoogleAuthProvider())
        window.location.reload()
    })
}


window.addEventListener('unload', async () => await writeUser(user))