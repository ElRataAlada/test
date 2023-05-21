import foodInfo from "../foods.json" assert {type: 'json'}

import { user } from "./auth.js"

export class FoodAPI {
    static getFood(name) {
        const loacalInfo = user?.cal?.allMeals || []
        foodInfo.push(...loacalInfo)

        const info = [...new Map(foodInfo.map(item => [item['name'], item])).values()];

        const res = []

        info.forEach(el => { if(el.name.toLowerCase().includes(name.toLowerCase())) res.push(el) })

        res.sort((a, b) => a.name.localeCompare(b.name))

        return res
    }
}