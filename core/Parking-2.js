const fs = require('fs'),
	moment = require('moment'),
	Ticket = require('./Ticket'),
	FILE = "parking.json"

moment.locale('fr')

class Parking2 {

	static init(max=100) {
		this.data = { max, theme : [], cars: [] }
		this.max = max
		try {
			this.data = JSON.parse(fs.readFileSync(FILE, { encoding: 'utf8' }))
			if(!"max" in this.data || this.data.max != max){
				this.data.max = max
			}
			if (!"theme" in this.data) {
				this.data.theme = []
			}
		} catch(ex) {
			console.error(ex)
		} finally {
			fs.writeFileSync(FILE, JSON.stringify(this.data), { encoding: 'utf8' })
			this.data = JSON.parse(fs.readFileSync(FILE, { encoding: 'utf8' }))
		}
	}

	static save() {
		fs.writeFileSync(FILE, JSON.stringify(this.data), { encoding: 'utf8' })
	}

	static generate() {
		const now = new Date(),
			digit = `${now.getDate()}${now.getMonth()}${now.getFullYear()}${now.getHours()}${now.getMinutes()}${now.getSeconds()}${now.getMilliseconds()}`,
			{ ticket } = Ticket.Generate(digit)
		return ticket
	}

	static add() {
		const car = {}
		if(this.data.cars.length >= this.max) return {
			car,
			status : 500,
			success : true,
			default : "parking full"
		}
		car['id'] = this.generate()
		car['entry'] = new Date()
		this.data['cars'].push(car)
		this.save()
		// console.log(`New car added - ${car['id']}`)
		return {
			car,
			status : 200,
			success : true,
			default : "car added"
		}
	}

	static remove(ticket) {
		if (!ticket) return {
			ticket,
			status : 400,
			success : false,
			default: "ticket rejected"
		}
		Ticket.Check(ticket)
		const cars = []
		if (Ticket.Check(ticket)) {
			this.data['cars'].map((v, i, a) => {
				if (v['id'] !== ticket) {
					cars.push(v)
				} else {
					// Calcul du montant
				}
			})
			const before = (this.data['cars'].length)
			this.data['cars'] = cars
			const after = (this.data['cars'].length)
			var res = {}
			if (before === after) {
				//console.log(`ID inexistant !`)
				res = {
					ticket,
					cars,
					status : 404,
					success : false,
					default : "ticket not found"
				}

			} else {
				//console.log(`Suppression éffectué !`)
				res = {
					ticket,
					cars,
					status : 200,
					success : true,
					default : "car removed"
				}
			}
		} else {
			//console.log(`Invalid digit !`)
			res =  {
				ticket,
				status : 400,
				success : false,
				default : "invalid ticket"
			}
		}
		this.save()
		return res
	}

	static clear() {
		delete this.data.cars
		this.data.cars = []
		this.save()
		return {
			success : true,
			status : 200,
			default : "data cleared"
		}
	}

	static list() {
		return this.data['cars']
	}

	static changeTheme(theme) {
		this.data.theme = theme
		this.save()
	}

}
module.exports = Parking2
