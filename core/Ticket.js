
class CheckDigits {


	/**
	 *
	 * @param {int} digit
	 */
	static Check(ticket) {
		const t = ticket.toString(),
			k = parseInt(t[t.length - 1]),
			v = (() => {
				let _tmp = ''
				const _array = [...t]
				_array.forEach((v, i, a) => {
					if (i < a.length - 1) _tmp += v
				})
			return _tmp
		})()
		return CheckDigits.Generate(v)['key'] === k
	}

	/**
	 *
	 * @param {string} digit
	 */
	static Generate(digit) {
		try {
			if (typeof digit !== 'string') {
				digit = digit.toString()
			}
			let ticket = {},
				digits = digit.split(''),
				odd = [],
				even = []
			//Manavaka chiffre paire sy impaire ao anaty tableau
			Maths.toNumber(digits).forEach((val, idx) => {
				if ((idx + 1) % 2 === 0) {
					even.push(val)
				} else {
					odd.push(val)
				}
			})
			// Traitement de l'algorithme
			let sum_odd = Maths.sum(odd),
				oddx3 = sum_odd * 3,
				sum_even = Maths.sum(even),
				sum = oddx3 + sum_even,
				mod_sum = sum % 10,
				bit = 0
			if (mod_sum === 0) {
				bit = mod_sum
			} else {
				bit = 10 - mod_sum
			}
			//Manambotra objet ticket
			ticket['key'] = bit
			ticket['value'] = parseInt(digit)
			ticket['ticket'] = parseInt(digit + bit)
			return ticket
		} catch (e) {
			console.log('Erreur :( \n' + e)
			return false
		}
	}
}

class Maths {

	//Manao somme ana tableau
	static sum(array) {
		let sum = 0
		array.forEach(val => sum += val)
		return sum
	}
	//Mamadika tableau ana string ho int
	static toNumber(array) {
		const numbers = []
		array.forEach(num => numbers.push(parseInt(num)))
		return numbers
	}
}

module.exports = CheckDigits
