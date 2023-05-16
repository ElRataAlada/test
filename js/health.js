export class Health {
    static setRecomendedWeight(user) {
        user.weight.recomended = 23 * ((user.height/100) * (user.height/100))
        return user
    }
    
    static setRecomendedWater(user){
        user.water.recomended = user.weight.current * 0.03
        return user
    }
    
    static setRecomendedCal(user){
        user.cal.recomended = user.sex === 'male' ? 
            user.weight.current * 10 + 6.25 * user.height - 5 * user.age + 5:
            user.weight.current * 10 + 6.25 * user.height - 5 * user.age - 161
        return user
    }
}