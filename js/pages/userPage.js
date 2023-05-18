import { logOut, writeUser } from '../auth.js'
import { Health } from '../health.js'
import { mainRef, user, userStateChanged } from '../index.js'

export function userPage(){
    // mainRef.innerHTML = ''
    // const mainRef = 
    const main = document.querySelector('.user-page')

    main.querySelector('#name').querySelector('span').innerHTML = user?.name || "None"
    main.querySelector('#weight').querySelector('span').innerHTML = user?.weight?.current || 0

    main.querySelector('#age').querySelector('span').innerHTML = user?.age || 0
    main.querySelector('#height').querySelector('span').innerHTML = user?.height || 0
    
    main.querySelector("#photo").setAttribute('src', user?.photoURL)

    let isInputAge = false
    let isInputName = false
    let isInputHeight = false
    let isInputWeight = false

    main.querySelectorAll('.info-item').forEach((item) => item.querySelector('span').addEventListener('click', function handler() {
        const id = item.id

        const input = document.createElement('input')
        input.className = 'info-input'
        
        if(id === 'name' && !isInputName) { input.id = id; input.placeholder = "Ім'я"; input.value = user.name; }
        else if(id === 'weight' && !isInputWeight) { input.id = id; input.placeholder = "Вага"; input.value = user?.weight?.current || 0; input.type = "number"; }
        else if(id === 'height' && !isInputHeight) { input.id = id; input.placeholder = "Зріст"; input.value = user?.height || 0; input.type = "number"}
        else if(id === 'age' && !isInputAge) { input.id = id; input.placeholder = "Вік"; input.value = user?.age || 0; input.type = "number"}
        else return

        if(input.placeholder) {
            item.removeChild(item.childNodes[0])

            input.addEventListener('keydown', (e) => {
                if (e.key !== 'Enter') return

                const id = e.currentTarget.id
                const span = document.createElement('span')
                
                if(id === 'name') {
                    user.name = e.currentTarget.value
                    span.innerHTML = user.name
                }
                else if(id === 'age') {
                    user.age = +e.currentTarget.value
                    span.innerHTML = user.age
                    Health.setRecomendedCal(user)
                }
                else if(id === 'weight') {
                    user.weight.current = +e.currentTarget.value
                    span.innerHTML = user.weight.current
                    Health.setRecomendedCal(user)
                    Health.setRecomendedWater(user)
                }
                else if(id === 'height') {
                    user.height = +e.currentTarget.value
                    span.innerHTML = user.height
                    Health.setRecomendedWeight(user)
                    Health.setRecomendedCal(user)
                } else return

                writeUser(user)
                userStateChanged()

                item.removeChild(input)
                span.addEventListener('click', handler)
                item.insertAdjacentElement('afterbegin', span)
            })

            item.insertAdjacentElement('afterbegin', input)
        }
    }))

    
    main.querySelector('#logout').addEventListener('click', (e) => {
        e.preventDefault()
        logOut()
        window.location.reload()
    })

}