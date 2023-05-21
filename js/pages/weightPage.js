import { isUserLoggined, writeUser } from '../auth.js'
import { Health } from '../health.js'
import { mainRef, userStateChanged, round, user } from '../index.js'

export function weightPage(){
    const minW = mainRef.querySelector('#min-w')
    const maxW = mainRef.querySelector('#max-w')
    const BMI = mainRef.querySelector('#BMI')

    const recomendedW = mainRef.querySelector('#weight-recomended')
    const goalW = mainRef.querySelector('#weight-goal')

    recomendedW.innerHTML = round(user?.weight?.recomended || 0)
    goalW.innerHTML = round(user?.weight?.goal || 0)
    
    minW.innerHTML = round(user?.weight?.min || 0)
    maxW.innerHTML = round(user?.weight?.max || 0)
    BMI.innerHTML = round(user?.weight?.BMI || 0)
    
    paintBMI()
}

function paintBMI(){
    const BMI = mainRef.querySelector('#BMI')

    const bmi = user.weight.BMI || 0

    if(bmi === 0) BMI.style.color = 'white'
    else if(bmi < 18.5 || bmi > 30) BMI.style.color = 'red'
    else if(bmi >= 18.5 && bmi <= 25) BMI.style.color = 'green'
    else if(bmi > 25 && bmi <= 30) BMI.style.color = 'orange'

}