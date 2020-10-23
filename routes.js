const fetch = require('node-fetch');
let url = 'http://159.89.100.23:8081'

let header =(token)=>{return {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Authorization": "Bearer "+token,
}};

function routes(app){
    app.post('/register',(req,res)=>{
        let body = req.body
        if(body){
            fetch(`${url}/api/auth/register`, {body})
            .then(res=>res.json())
            .then(data=>{
                if(data.user){
                    res.cookies('token',data.access_token,{maxAge: 3600, httpOnly: false})
                    res.json({status: 'success', 'name':data.user.name, 'email':data.user.email, 'id':data.user.id})
                }else{
                    res.json({status:'Failed'})
                }
            }).catch(e=>{
                res.json({status:'Failed'})
            })
        }else{
            res.json({status:'Failed'})
        }
    })
    app.post('/login', (req,res)=>{
        let body = req.body
        if(body && body.email && body.password){
            fetch(`${url}/api/auth/login`, {method: "POST",body})
            .then(res=>res.json())
            .then(data=>{
                if(data.user){
                    res.cookies('token',data.access_token,{maxAge: 3600, httpOnly: false})
                    res.json({status: 'success', 'name':data.user.name, 'email':data.user.email, 'id':data.user.id})
                }else{
                    res.json({status:'Failed'})
                }
            }).catch(e=>{
                res.json({status:'Failed'})
            })
        }else{
            res.json({status:'Failed'})
        }
    })
    app.get('/meterTransactions/:id', async(req, res)=>{
        let serial = req.params.id
        if(serial){
            let token = cookie('token')
            let date = new Date()
            let from = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
            let end = `${date.getFullYear()-1}-${date.getMonth()}-${date.getDate()}`
            let datum = await consumption(token, serial, from, end)
            let data = await meterTransactions(token, serial)
            if(datum && data){
                datum = datum.slice(-1)[0]
                let refData = data.map(i=>{return{'unit':i.paid_for.energy,'amount':i.transaction.amount, 'date':i.created_at}})
                res.json({'history':refData.slice(0,15),'availableUnit':datum.credit_on_meter, 'daily': datum.daily_consumption})
            }else{
                res.json({status:'Failed'})
            }
            
        }else{
            res.json({status:'Failed'})
        }
    })
    app.get('/personTransaction/:serial', async(req,res)=>{
        let serial = req.params.id
        if(serial){
            let token = cookie('token')
            let data = await personTransaction(token, serial)
            if(data){
                let refData = data.map(i=>{return{'amount':i.transaction.amount, 'date':i.transaction.created_at}})
                res.json(refData)
            }else{
                res.json({status:'Failed'})
            }
        }else{
            res.json({status:'Failed'})
        }
    })
    app.get('/consumption/:serial?time=timer', async(req,res)=>{
        let time = req.query.timer
        let serial = req.params.serial
        if(time && time){
            let token = cookie('token')
            let date = new Date()
            let from = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
            let end
            if(time == 'year'){
                end = `${date.getFullYear()-1}-${date.getMonth()}-${date.getDate()}`
            }else if(time == 'month'){
                end = `${date.getFullYear()}-${date.getMonth()-1>0?date.getMonth()-1:11}-${date.getDate()}`
            }else if(time == 'day'){
                end = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()-1>0?date.getDate()-1:28}`
            }
            let datum = await consumption(token, serial, from, end)
            let detail = await details(token,serial)
            
            if(datum && detail){
                let deet = detail.meter_parameter.tariff.price
                let gross = (datum.slice(-1)[0]).total_consumption - (datum[0].total_consumption)
                res.json({'energy':gross, 'tariff': detail})
            }else{
                res.json({status:'Failed'})
            }
        }else{
            res.json({status:'Failed'})
        }
    })
    app.post('/createMeter', async(req,res)=>{
         let body = req.body
         if(body){
             let token = cookie('token')
             let data = await create(token, body )
             if(data){
                res.json({status:'success'})
             }else{
                res.json({status:'Failed'})
             }
         }
    })
    app.get('/allMeters/:person', async(req,res)=>{
         let person = req.params.person
         if(person){
             let token = cookie('token')
             let data = await personMeters(token, person)
             if(data){
                res.json({'meters':data.meters})
             }else{
                res.json({status:'Failed'})
             }
         }else{
            res.json({status:'Failed'})
         }
    })
    app.post('/addPerson', async(req,res)=>{
        let body = req.body
        if(body){
            let token = cookie('token')
            let data = await createPerson(token, body)
            if(data){
                res.json({status:'success', 'data':data})
            }else{
                res.json({status:'Failed'})
             }
        }else{
            res.json({status:'Failed'})
         }
    })
    app.put('/updatePerson/:id', async(req,res)=>{
         let body = req.body
         let person = req.params.id
         if(body && person){
            let token = cookie('token')
            let data = await updatePerson(token, body, person)
            if(data){
                res.json({status:'success'})
            }else{
                res.json({status:'Failed'})
            }
         }else{
            res.json({status:'Failed'})
         }
    })
    app.post('/addAddress/:person', async(req,res)=>{
        let body = req.body
        let person = req.params.person
        if(body && person){
            let token = cookie('token')
            let data = await createAddress(token, body, person)
            if(data){
                res.json({status:'success', 'data':data})
            }else{
                res.json({status:'Failed'})
            }
        }else{
            res.json({status:'Failed'})
         }
    })
    app.put('/updateAddress/:person', async(req,res)=>{
        let body = req.body
        let person = req.params.person
        if(body && person){
            let token = cookie('token')
            let data = await updateAddress(token, body, person)
            if(data){
                res.json({status:'success'})
            }else{
                res.json({status:'Failed'})
            }
        }else{
            res.json({status:'Failed'})
         }
    })
    app.get('addresses/:person', async(req, res)=>{
        let person = req.params.person
        if(person){
            let token = cookie('token')
            let data = await  personAddresses(token, body, person)
            if(data){
                res.json({'addresses': data})
            }else{
                res.json({status:'Failed'})
            }
        }
    })
}
function cookie(id){
    let rawCookie = req.headers.cookie.split('; ')
    let refCookie = rawCookie.map(i=>{
        let lis = i.split('=')
        return {id:lis[0], value:lis[1]}
    })
    let des = refCookie.filter(i=>i.id==id)
}
async function create(token, body){
    
    let headers = header(token)
    let ris = await fetch(`${url}/api/meter`, {method: "POST",headers, body})
    let data = await ris.json()
    return data
}
async function details(token, serial){
    let headers = header(token)
    let ris = await fetch(`${url}/api/meter/${serial}`, {method: "GET",headers})
    let data = await ris.json()
    return data.data.meter_parameter
}
async function meterTransactions(token, serial){
    let headers = header(token)
    let ris = await fetch(`${url}/api/meters/${serial}/transactions`, {method: "GET",headers})
    let data = await ris.json()
    return data.data
}
async function consumption(token, serial, start, end){
    let headers = header(token)
    let ris = await fetch(`${url}/api/meters/${serial}/consumptions/${start}/${end}`, {method: "GET",headers})
    let data = await ris.json()
    return data.data
}
async function paymentDetails(token,personId,period,limit, order){
    let headers = header(token)
    let ris = await fetch(`${url}/api/paymenthistories/${personId}/payments/${period}/${limit}/${order}`, {method: "GET",headers})
    let data = await ris.json()
    return data
}
async function createAddress(token, body, personId){
    let headers = header(token)
    let ris = await fetch(`${url}/api/people/${personId}/addresses`, {method: "POST",headers, body})
    let data = await ris.json()
    return data
}
async function updateAddress(token, body, personId){
    let headers = header(token)
    let ris = await fetch(`${url}/api/people/${personId}/addresses`, {method: "PUT",headers, body})
    let data = await ris.json()
    return data
}
async function personTransaction(token, personId){
    let headers = header(token)
    let ris = await fetch(`${url}/api/people/${personId}/transactions`, {method: "GET",headers})
    let data = await ris.json()
    return data.data
}
async function personAddresses(token, person){
    let headers = header(token)
    let ris = await fetch(`${url}/api/people/${person}/addresses`, {method: "GET",headers})
    let data = await ris.json()
    return data.data
}
async function personMeters(token, person){
    let headers = header(token)
    let ris = await fetch(`${url}/api/people/${person}/meters`, {method: "GET",headers})
    let data = await ris.json()
    return data.data
}
async function createPerson(token, body){
    let headers = header(token)
    let ris = await fetch(`${url}/api/people`, {method: "POST",headers, body})
    let data = await ris.json()
    return data
}
async function updatePerson(token, body, personId){
    let headers = header(token)
    let ris = await fetch(`${url}/api/people/${personId}`, {method: "PUT",headers, body})
    let data = await ris.json()
    return data
}
module.exports = routes