export function waterHistoryChart(user, lenght){
    if(!user || Object.keys(user.history).length <= 0) return
    
    google.charts.load('current', {'packages':['corechart']})
    google.charts.setOnLoadCallback(DWH)

    function DWH(){
        let waterData = []

        const history = user?.history
        const now = new Date()
        now.setHours(0,0,0,0)

        const day = 1000*60*60*24

        const rday = now.getTime() - day
        const lday = Math.abs(rday - lenght * day) + day

        let maxT = 0
        let minT = Number.MAX_VALUE

        for(const tkey in history){
            if(lenght !== 0 && (+tkey < lday || +tkey > rday)) continue

            minT = minT < +tkey ? minT : +tkey
            maxT = maxT > +tkey ? maxT : +tkey

            const wdata = history[tkey]?.water
            
            if(wdata) waterData.push([+tkey, wdata.current, wdata.recomended])
        }

        // if(maxT < +rday) waterData.push([+rday, null, null])
        // if(minT > +lday) waterData.push([+lday, null, null])
        
        waterData = waterData.sort((arr1, arr2) => arr1[0] - arr2[0])
        const yearWaterData = []

        if(lenght === 7){
            waterData = waterData.map(arr => {
                const date = new Date(+arr[0])
                
                return [date.getDate(), arr[1], arr[2]]
            })
        } 
        else if(lenght === 30){
            waterData = waterData.map(arr => {
                const date = new Date(+arr[0])

                const month = date.getMonth()+1 >= 10 ? `${date.getMonth()+1}` : `0${date.getMonth()+1}`
                
                return [`${date.getDate()}.${month}`, arr[1], arr[2]]
            })
        } else if (lenght === 365 || lenght === 0){
            const months = ['Січ','Лют','Бер','Квіт','Трав','Черв','Лип','Сер','Вер','Жовт','Лист','Груд']
            
            const d = new Date(+waterData[0][0])
            
            const prevDate = {
                month: d.getMonth(),
                year: d.getFullYear()
            }
            
            let sum = []
            let sumTarget = []
            let i = 0

            for(const arr of waterData){
                const date = new Date(+arr[0])
                i++
                if(date.getFullYear() > prevDate.year || date.getMonth() > prevDate.month || i == waterData.length-1){
                    if(lenght === 365) yearWaterData.push([months[+prevDate.month], +sum.reduce((a, b) => a + b, 0) / sum.length , +sumTarget.reduce((a, b) => a + b, 0) / sumTarget.length ])
                    else if(lenght === 0) yearWaterData.push([`${months[+prevDate.month]} ${prevDate.year}`, +sum.reduce((a, b) => a + b, 0) / sum.length , +sumTarget.reduce((a, b) => a + b, 0) / sumTarget.length ])
                    
                    sum = []
                    sumTarget = [] 
                }
                
                if(arr[1] != null) sum.push(arr[1])
                if(arr[2] != null) sumTarget.push(arr[2])
                
                prevDate.month = date.getMonth()
                prevDate.year = date.getFullYear()
            }
        }

        const options = {
            curveType: 'function',
            backgroundColor: 'transparent',
            legend: 'none',
            hAxis : {
                baselineColor: '#fff',
                gridlines: {
                    color: 'transparent',
                },
                textStyle: {color: '#fff'},
                format: 0,
                textPosition: lenght === 0 ? 'none' : 'out',
            },
            vAxis : {
                gridlines: {
                    color: 'transparent',
                },
                textStyle: {color: '#fff'},
                format: 0,
                baselineColor: '#fff',  
            },
            colors: ['#3175dd', 'red'],
        }

        const wdata = lenght === 365 || lenght === 0 ? yearWaterData : waterData

            
        const data = new google.visualization.arrayToDataTable([
            ['date', 'Було випито', 'Ціль'],
            ...wdata
        ]);

        document.getElementById('main-water-chart').innerHTML = ''
        
        const chart = new google.visualization.LineChart(document.getElementById('main-water-chart'));
        
        chart.draw(data, options);
    }
}