const fs = require('fs')
const Ticket = require('./Ticket')
const { MAX_CAR, SUCCESS, ERROR, EXIST, FILE, INCORRECT, NOT_FOUND } = require('../utils/Constant')

class Parking {

	/**
	 * Manoratra ny data ao aminy fichier data.json
	 */
	static async save() {
		fs.writeFileSync(FILE, JSON.stringify(Parking.data))
	}

	/**
	 * Maka ny data ao aminy fichier data.json
	 * @returns  {object}
	 */
	static async getData() {
		const exist = await fs.existsSync(FILE)
		var data = {}
		if (!exist) {
			data = Parking.setData()
			await fs.writeFileSync(FILE, JSON.stringify(data), { encoding: 'utf8' })
		} else {
			data = await JSON.parse(fs.readFileSync(FILE, { encoding: 'utf8' }))
		}
		return data
	}

	/**
	 * Mi initialliser valeur max ny parking
	 * @param {int} max = 10
	 */
	static async setMax(max = 10) {
		Parking.data.max = max
		await Parking.save()
	}

	/**
	* Mi initialliser ny data
	*/
	static async setData() {
		return { max: MAX_CAR, dark: false, cars: [], history: {} }
	}

	/**
	 * Maka fiara aminy alalana parametre
	 * @param {object} options
	 */
	static async getCar(options) {
		if (typeof options === 'object') {
			for (let key in options) {

			}
		} else {
			throw "Params should be an object";
		}
	}

	/**
	 * Maka fiara aminy alalany matricule ao aminy table iray, par defaut "cars"
	 * @param {matricule} prop
	 * @param {string} from = "cars"
	 * @return {object}
	 */
	static async getCarById(id) {
		let carFounded = null
		let data = Parking.data.cars
		await data.map(async (car) => {
			if (car.id === id) {
				carFounded = car
			}
		})
		return carFounded ? { response: carFounded, type: SUCCESS } : { response: `#ID : ${id} n'est pas dans le parking`, type: NOT_FOUND }
	}

	/**
	 * Maka fiara aminy alalany proprietaire ao aminy table iray, par defaut "cars"
	 * @param {string} prop
	 * @param {string} from = "cars"
	 * @return {object}
	 */
	static async getCarByProp(prop) {
		let carFounded = []
		let data = Parking.data.cars
		if (data) {
			await data.map(async (car) => {
				if (car.proprietary === prop) {
					carFounded.push(car)
				}
			})
		}
		return carFounded.length ? { response: carFounded, type: SUCCESS } : { response: `Aucune resultats`, type: NOT_FOUND }
	}

	/**
	 * Mampiditra fiara ao aminy sockage
	 * @param {object} car
	 * @return {object}
	 */
	static async addCar(car) {
		if (car === undefined) return { response: "Véhicule invalide", type: INCORRECT }
		if (Parking.data) {
			if (Parking.getCarById(car.id).type === SUCCESS) return ({ response: `Véhicule #ID : ${car.id} est déjà dans le parking`, type: EXIST, car })
			if (Parking.data.cars.length < Parking.data.max) {
				car.in = new Date()
				car.ticket = await Parking.generateTicket(car)
				Parking.data.cars.push(car)
				await Parking.save()
				return ({ response: `Véhicule #ID : ${car.id} de ${car.proprietary} bien ajouter`, type: SUCCESS, car, data: Parking.getData() })
			}
			return ({ response: `Parking plein!  Impossible d'ajouter la véhicule #ID : ${car.id} de ${car.proprietary}`, type: ERROR, car, data : Parking.getData() })
		}
	}

	/**
	 * Manala fiara ao aminy stockage
	 * @param {matricule} Matricule
	 * @return {object}
	  */
	static async removeCar(id) {
		if (Parking.getCarById(id).type !== SUCCESS) {
			return ({ response: `Véhicule inexistant`, type: NOT_FOUND, data : Parking.getData() })
		}
		let cars = []
		const deleted = await Parking.getCarById(id).response
		let history = Parking.data.history
		await Parking.data.cars.map(async (car) => {
			if (car.id !== deleted.id) {
				cars.push(car)
			} else if (car.id === deleted.id) {
				let date = `${new Date(car.in).getDate()}-${new Date(car.in).getMonth()}-${new Date(car.in).getFullYear()}`
				car.out = new Date()
				if (history[date] === undefined) {
					history[date] = []
					history[date].push(car)
				} else {
					history[date].push(car)
				}
			}
		});
		Parking.data.cars = cars
		Parking.data.history = history
		await Parking.save()
		return { response: `Véhicule #ID : ${id} sorti du Parking !`, type: SUCCESS , data: Parking.getData()}
	}

	/**
	 * Mamorona ticket unique ho ana fiara iray
	 * @param {object} car
	 * @return {object}
	 */
	static async generateTicket(car) {
		let carIn = new Date(car.in)
		let tmpTicket = `${carIn.getDate()}${carIn.getMonth()}${carIn.getFullYear()}${carIn.getHours()}${carIn.getMinutes()}`
		let count = 1
		let ticket = await Ticket.Generate(tmpTicket)
		ticket.final = ticket.ticket + `-0`
		await Parking.data.cars.map(
			async (car) => {
				if (new Date(car.in).getMinutes() === carIn.getMinutes() && new Date(car.in).getDate() === carIn.getDate() && new Date(car.in).getMonth() === carIn.getMonth()) {
					ticket.ref = count
					ticket.final = ticket.ticket + `-${ticket.ref}`
					count++
				}
			}
		)
		return ticket
	}

	static async clear() {
		Parking.data.cars.forEach(async car => {
			await Parking.removeCar(car.id)
		});
		return { response: "Parking vider !", type: SUCCESS , data: Parking.getData()}
	}

	static async dark(value) {
		Parking.data.dark = value
		Parking.save()
	}

	static async history() {
		let _value = []
		let keys = (Object.keys(Parking.data.history))
		keys.forEach(async (date, idx) => {
			await Parking.data.history[date].forEach(async (v, i) => {
				_value.push(v)
			})
			_value.push(date)
		})
		return _value
	}

}

module.exports = Parking
