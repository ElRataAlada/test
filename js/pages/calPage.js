import { FoodAPI } from '../foodAPI.js'
import { mainRef, round, user, userStateChanged } from '../index.js'

export function calPage(){
    mainRef.innerHTML = '<div class="cal-page page"><div class="food-info"><label class="recomended"><h2>Рекомендована кількість в день</h2><h3><p id="food-recomended">0</p> <f>ккал</f></h3></label><label class="recomended goal"><h2>Бажана кількість</h2><h3><p id="food-goal">0</p> <f>ккал</f></h3><button class="edit" id="food-edit-goal"><img src="./img/ico/edit.png" alt="edit"></button></label></div><div class="main-info"><div class="line"><div class="search"><input class="input" type="text" id="input-name" autofocus placeholder="Назва продукту"><button type="button" class="search-btn" id="btn-search-food"><img src="./img/ico/search.png" alt="search"></button></div><div class="weight"><input class="input" type="number" id="input-weight" placeholder="Вага (г)"></div></div><div class="line"><div class="col"><div class="unit"><h3>Калорії (ккал):</h3><span class="span" id="span-cal">0</span></div></div><div class="col"><div class="unit"><h3>Білки (г):</h3><span class="span" id="span-prot">0</span></div><div class="unit"><h3>Жири (г):</h3><span class="span" id="span-fat">0</span></div><div class="unit"><h3>Вуглеводи (г):</h3><span class="span" id="span-carb">0</span></div></div></div><button type="button" class="eat-btn" id="eat-btn">Схавать</button></div></div>'

    const eatBtn = mainRef.querySelector('#eat-btn')

    const btnSearch = mainRef.querySelector('#btn-search-food')
    const search = mainRef.querySelector('.search')

    const weight = mainRef.querySelector('#input-weight')

    const inputName = mainRef.querySelector('#input-name')
    let spanCal = mainRef.querySelector('#span-cal')
    let spanProt = mainRef.querySelector('#span-prot')
    let spanFat = mainRef.querySelector('#span-fat')
    let spanCarb = mainRef.querySelector('#span-carb')

    let isEditGoal = false
    let isSelectOpen = false
    mainRef.querySelector('#food-edit-goal').addEventListener('click', editGoalHandler)

    function editGoalHandler(e){
        const foodEditGoal = mainRef.querySelector('#food-goal')

        if(isEditGoal) {
            foodEditGoal.insertAdjacentHTML('afterbegin', `<p id="food-goal">${user?.cal?.goal || 0}</p>`)
            foodEditGoal.querySelector('#food-goal').addEventListener('click', editGoalHandler)
            mainRef.querySelector('#food-edit-goal-input').remove()
            isEditGoal = false
        } else {
            foodEditGoal.innerHTML = ''
            foodEditGoal.insertAdjacentHTML('afterbegin', '<input type="number" id="food-edit-goal-input">')

            const input = foodEditGoal.querySelector('#food-edit-goal-input')
            input.focus()

            input.addEventListener('keydown', (e) => {
                if(e.key == 'Enter'){
                    user.cal.goal = +e.target.value || 0

                    if(user.cal.goal !== 0) user.cal.target = user.cal.goal
                    else user.cal.target = user.cal.recomended

                    userStateChanged()
                    
                    input.remove()
                    foodEditGoal.innerHTML = user.cal.goal || 0
                    isEditGoal = false
                }
            })
            isEditGoal = true
        }
    }

    mainRef.querySelectorAll('span').forEach(span => span.addEventListener('click', spanHandler))

    function inputHandler(e) {
        const val = e.target.value || 0

        if(e.key == 'Enter'){
            e.target.insertAdjacentHTML('afterend', `<span class="span" id="${"span-" + e.target.id.split('-')[1]}">${val}</span>`)
            e.target.remove()
            mainRef.querySelector(`#${"span-" + e.target.id.split('-')[1]}`).addEventListener('click', spanHandler)

            try{
                spanCal = mainRef.querySelector('#span-cal')
                spanProt = mainRef.querySelector('#span-prot')
                spanFat = mainRef.querySelector('#span-fat')
                spanCarb = mainRef.querySelector('#span-carb')
            } catch(e) { }
        }
    }

    function spanHandler(e){
        const cSpan = e.currentTarget

        const input = document.createElement('input')
        input.type = 'number'
        input.className = 'input'
        input.id = 'input-' + e.currentTarget.id.split('-')[1]
        input.style.maxWidth = '5ch'

        cSpan.insertAdjacentElement('afterend', input)

        input.addEventListener('keydown', inputHandler)
        
        input.focus()
        
        cSpan.remove()
    }

    eatBtn.addEventListener('click', (e) => {
        const name = inputName.value || ''

        const cal = +spanCal.innerHTML || 0

        const prot = +spanProt.innerHTML || 0
        const fat = +spanFat.innerHTML || 0
        const carb = +spanCarb.innerHTML || 0

        console.log(name, cal, prot, fat, carb)

        if(!name || !cal || !prot || !fat || !carb) return

        user.cal.current += cal
        user.cal.prot += prot
        user.cal.fat += fat
        user.cal.carb += carb

        user.cal.meals.push({
            name: name,
            cal: cal,
            prot: prot,
            fat: fat,
            carb: carb,
            weight: +weight.value || 0,
            time: new Date().getTime()
        })

        console.log(user.cal)

        userStateChanged()
    })
    
    btnSearch.addEventListener('click', (e) =>{
        e.preventDefault()

        if(isSelectOpen) {
            search.removeChild(search.querySelector('.food-select'))
            isSelectOpen = false
        }
        else if(!isSelectOpen) {
            search.insertAdjacentHTML('beforeend', '<div class="food-select"> <input class="food-select-input" placeholder="Пошук" /> <div class="food-select-options"> </div> </div>')
            
            const foodSelectInput = mainRef.querySelector('.food-select-input')
            const foodSelectOptions = mainRef.querySelector('.food-select-options')

            foodSelectInput.addEventListener('blur', (e) => {
                setTimeout(() => {
                    try{
                        isSelectOpen = false
                        search.removeChild(search.querySelector('.food-select'))
                    }
                    catch(e){}
                }, 200);
            })
            
            function selectHandler(e){
                const query = e.target.value
                
                const products = FoodAPI.getFood(query)
                
                foodSelectOptions.innerHTML = ''
                if(!isSelectOpen) foodSelectInput.insertAdjacentHTML('afterend', '<div class="info" id="select-info">Назва <span>Ккал</span></div>')
                
                products.forEach(prod => {
                    foodSelectOptions.innerHTML += `<div><p>${prod.name}</p><span>${prod.cal}</span></div>`
                })
                
                foodSelectOptions.querySelectorAll('div').forEach(el => el.addEventListener('click', (e) => {
                    const query = e.currentTarget.querySelector('p')?.innerHTML || null
                    
                    if(!query) return
                    
                    const meal = FoodAPI.getFood(query)[0]
                    passData(meal)

                    weight.addEventListener('input', (e)=>{
                        const val = +e.target.value || 0
                        passData(meal, val)
                    })

                    search.removeChild(search.querySelector('.food-select'))
                    isSelectOpen = false
                }))    
                
                isSelectOpen = true
            }
        
            foodSelectInput.addEventListener('focus', selectHandler)
            foodSelectInput.addEventListener('input', selectHandler)

            foodSelectInput.focus()
        }
    })


    function passData(meal, w = 100){
        weight.value = w

        inputName.value = meal.name

        spanCal.innerHTML = round(meal.cal * (+weight.value / 100))
        spanProt.innerHTML = round(meal.prot * (+weight.value / 100))
        spanFat.innerHTML = round(meal.fat * (+weight.value / 100))
        spanCarb.innerHTML = round(meal.carb * (+weight.value / 100))
    }

    updatePage()
}


function updatePage(){
    const foodRecomended = mainRef.querySelector('#food-recomended')
    const foodGoal = mainRef.querySelector('#food-goal')

    foodRecomended.innerHTML = user?.cal?.recomended || 0
    foodGoal.innerHTML = user?.cal?.goal || 0
}