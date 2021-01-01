type Row = {
	id: string,
	permitSubClass: string,
	permitClass: string,
	permitType: string,
	permitSubType: string,
	description: string,
	issued: string,
	expires: string,
	completed: string,
	status: string,
	address: string,
	city: string,
	state: string,
	zip: string,
	lat: number,
	long: number,
	link: string,
}

interface IPoint {
	x: number,
	y: number
}

interface IRect {
	x: number,
	y: number,
	w: number,
	h: number
}

export type { Row, IPoint, IRect }
