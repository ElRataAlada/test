import foodInfo from "../foods.json" assert {type: 'json'}

export class FoodAPI {

    static info = foodInfo

    static getFood(name){
        const res = []

        this.info.forEach(el => { if(el.name.toLowerCase().includes(name.toLowerCase())) res.push(el) })

        res.sort((a, b) => a.name.localeCompare(b.name))

        return res
    }
}