import { isUserLoggined, authStateChanged, getUser, writeUser} from './auth.js'

export const mainRef = document.querySelector('main')
export let user = {}

import { waterPage } from './pages/waterPage.js'
import { calPage } from './pages/calPage.js'
import { notePage } from './pages/notePage.js'
import { userPage } from './pages/userPage.js'
import { weightPage } from './pages/weightPage.js'

let selectedPage = 'weight'
menu()

authStateChanged(async (u) => {
    if(u){
        user = await getUser(u.uid)

        if(isUserLoggined(user)) writeUser(user)

        menu()
    }
})

export async function userStateChanged(){
    await writeUser(user)
    menu()
}

export function round(number) { return Math.floor(number * 100) / 100 }

function menu(){
    const menu = document.querySelector('#menu')
    menu.innerHTML = ''

    weightButton(round(user?.weight?.current || 0))
    waterButton(round(user?.water?.current || 0), round(user?.water?.target || 0))
    caloriesButton(round(user?.cal?.current || 0), round(user?.cal?.target || 0))
    noteButton()
    
    userButton()

    const menuBtns = document.querySelectorAll('.menu-bnt')

    menuBtns.forEach(btn => {
        btn.getAttribute('data-page') === selectedPage ? 
            btn.setAttribute('selected', '') :
            btn.removeAttribute('selected')
    })

    menuBtns.forEach(btn => btn.addEventListener('click', (e) => {
        e.preventDefault()
        const page = e.currentTarget.getAttribute('data-page')

        selectPage(page)

        menuBtns.forEach(btn => {
            btn.getAttribute('data-page') === page ? 
                btn.setAttribute('selected', '') :
                btn.removeAttribute('selected')
        })
    }))

    const profileBtn = menu.querySelector('#profile')
    
    if(isUserLoggined(user)){
        profileBtn.innerHTML = `<img src=${user.photoURL} alt=\"user\" class="user-photo"> <h2>${user.name}</h2>`
    }

    function weightButton(currentWeight){
        menu.innerHTML += `<button type="button" title="Вага" data-page="weight" class="menu-bnt"><img src="./img/ico/scales.png" alt="scales"><div class="content"><p class="user-done"><span>${currentWeight} </span>кг</p></div></button>`;
    }

    function waterButton(waterCurrent, waterTarget){
        menu.innerHTML += `<button type=\"button\" data-page=\"water\" title=\"Вода\" class=\"menu-bnt\"><img src=\"./img/ico/water.png\" alt=\"water\"><div class=\"content\"><div class=\"info\"><p class=\"user-done\" id=\"water-done\"><span> ${waterCurrent} </span> л</p><p class=\"user-target\" id=\"water-target\"> ${waterTarget} </p></div><progress class=\"progress\" id=\"water-progress\" max=\"${waterTarget}\" value=\"${waterCurrent}\" /></div></button>`
        
        if(waterCurrent >= waterTarget) menu.querySelector('#water-progress').classList.add('done')
        else menu.querySelector('#water-progress').classList.remove('done')
    }
    
    function caloriesButton(currentCal, calTarget){
        menu.innerHTML += `<button type="button" title="Калорії" data-page="cal" class="menu-bnt"><img src="./img/ico/meal.png" alt="cal"><div class="content"><div class="info"><p class="user-done" id="cal-done"><span> ${currentCal} </span>ккал</p><p class="user-target" id="cal-target"> ${calTarget} </p></div><progress class="progress" id="cal-progress" max="${calTarget}" value="${currentCal}" /></div></button>`
        
        if(currentCal >= calTarget) menu.querySelector('#cal-progress').classList.add('done')
        else menu.querySelector('#cal-progress').classList.remove('done')
    }
    
    function noteButton(){
        menu.innerHTML +=  "<button type=\"button\" data-page=\"note\" title=\"Нотатки\" class=\"menu-bnt\"><img src=\"./img/ico/diary.png\" alt=\"diary\"></button>";
    }
    
    function userButton(){
        menu.innerHTML += "<button type=\"button\" id='profile' data-page=\"profile\" title=\"Профіль\" class=\"menu-bnt profile-btn\"><img src=\"./img/ico/user.png\" alt=\"user\"></button>";
    }
}

function selectPage(page = 'weight'){
    selectedPage = page

    switch (page) {
        case 'weight':
            weightPage()
            break;
            
        case 'water':
            waterPage()
            break;
                
        case 'cal':
            calPage()
            break;

        case 'note':
            notePage()
            break;

        case 'profile':
            userPage()
            break;
    
        default:
            weightPage()
    }
}