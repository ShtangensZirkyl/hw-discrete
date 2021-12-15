window.addEventListener("load",main,false);//подключаем скрипт

function main() {

	var ctx=example.getContext("2d");

	var	N       = 50;

	let	k		= 10;   //коэф. жесткости
	let period 	= Math.sqrt(k);
	let	dt 		= 1/200 * period;  //переменная интегрироваания сделать 1/20 периода колебаний

	let v_y 	= [];
	let v_x 	= [];
	let	F_x 	= [];
	let	F_y 	= [];

	let	phi     = 2 * Math.PI / N;
	let	Radius  = 4;
	let	x       = [];
	let	y     	= [];

	for (let i = 0; i < N; i++) {
		x.push(Radius * Math.cos(phi * i));
		y.push(Radius * Math.sin(phi * i));
		v_y.push(0.08);
		v_x.push(-0.4);
	}

	//v_x[10] = -1;

	let l = Math.sqrt(Math.pow((x[1] - x[0]),2) + Math.pow((y[1] - y[0]),2));

	function Elastic_forces(k1, k2, k3) {
		var	dl_right;
		var	dl_left;
		var	F_l_y;
		var	F_r_y;

		var	F_l_x;
		var	F_r_x;

		var	cos_l;
		var	cos_r;
		var	sin_l;
		var	sin_r;

		dl_left	= Math.sqrt(Math.pow((x[k2] - x[k1]),2) + Math.pow((y[k2] - y[k1]),2));
		dl_right= Math.sqrt(Math.pow((x[k3] - x[k2]),2) + Math.pow((y[k3] - y[k2]),2));

		cos_l 	= ((y[k2] - y[k1])) / dl_left;
		sin_l 	= ((x[k2] - x[k1])) / dl_left;
		F_l_y 	= -k * (dl_left - l) * cos_l;
		F_l_x 	= -k * (dl_left - l) * sin_l;

		cos_r 	= ((y[k3] - y[k2])) / dl_right;
		sin_r 	= ((x[k3] - x[k2])) / dl_right;
		F_r_y 	= -k * (dl_right - l) * cos_r;
		F_r_x 	= -k * (dl_right - l) * sin_r;

		return [F_l_x, F_l_y, F_r_x, F_r_y];
	}

	function Square() {
		let S1 = 0;
		let S2 = 0;

		for (let i = 0; i < N - 1; i++) {
			S1 += x[i] * y[i+1];
		}

		for (let i = 0; i < N - 1; i++) {
			S2 += x[i+1] * y[i];
		}

		return 1/2 * Math.abs(S1 + x[N-1] * y[0] - S2 - x[0] * y[N-1]);
	}

	function Sum(term, lower_bound, upper_bound) {
		let s = 0;
		for (let i = lower_bound; i < upper_bound; i++) {
			s += term[i];
		}
		return s;
	}

	function mass_center() {
		let x_mass_center = Sum(x, 0, N) / N;
		let y_mass_center = Sum(y, 0, N) / N;
		return [x_mass_center, y_mass_center];
	}

	let s0 		 = Square();

	let F_pres_x = [];
	let	F_pres_y = [];

	function Pressure() {
		let k_pres = -1500;
		let sin_p;
		let cos_p;
		let rad;
		let x_c = mass_center()[0];
		let y_c = mass_center()[1];
		let sq = Square(); //площадь в текущий момент
		for (let i = 0; i < N; i++) {
			rad = Math.sqrt(Math.pow((x[i] - x_c), 2) + Math.pow((y[i] - y_c), 2));
			cos_p = (x[i] - x_c) / rad;
			sin_p = (y[i] - y_c) / rad;

			F_pres_x[i] = k_pres * (sq / s0 - 1) * cos_p;
			F_pres_y[i] = k_pres * (sq / s0 - 1) * sin_p;
			console.log("i = " + i + ", F_pres_x = " + F_pres_x[i] + ", F_pres_y = " + F_pres_x[i]);
		}
	}

	function physics() {
		let F_elast = [];

		F_elast[0] = Elastic_forces(N-1, 0, 1);
		for (let i = 1; i < N - 1; i++) {
			F_elast[i] = Elastic_forces(i-1, i, i+1);
		}
		F_elast[N-1] = Elastic_forces(N - 2, N - 1, 0);

		Pressure();

		for (let i = 0; i < N; i++) {
			F_y[i] = -F_elast[i][3] + F_elast[i][1] + F_pres_y[i];
			F_x[i] = F_elast[i][0] - F_elast[i][2] + F_pres_x[i] + LennardJhones(-9 - x[i]);

			v_y[i] += F_y[i] * dt;
			y[i] += v_y[i] * dt;
			v_x[i] += F_x[i] * dt;
			x[i] += v_x[i] * dt;
		}
	}

	function LennardJhones(r) {
		let sigma 	= 0.2;
		let epsilon = 0.01;
		return 4 * epsilon * ((sigma / r) ** 12 - (sigma / r) ** 6);
	}

	function draw() {
		ctx.beginPath();
		ctx.fillStyle = 'white';
		ctx.rect(0, 0, 400, 400);
		ctx.fill();

		for (let i = 0; i < N; i++) {
			ctx.beginPath();
			ctx.fillStyle = 'black';
			ctx.arc(200 + x[i] * 20, 200 + y[i] * 20, 3, 0, 2*Math.PI);
			ctx.fill();
		}

		for (let i = 0; i < N-1; i++) {
			ctx.beginPath();
			ctx.strokeStyle = 'black';
			ctx.moveTo(200 + x[i] * 20, 200 + y[i] * 20);
			ctx.lineTo(200 + x[i+1] * 20, 200 + y[i+1] * 20);
			ctx.stroke();
		}

		ctx.beginPath();
		ctx.moveTo(200 + x[N-1] * 20, 200 + y[N-1] * 20);
		ctx.lineTo(200 + x[0] * 20, 200 + y[0] * 20);
		ctx.stroke();

		ctx.beginPath();
		ctx.strokeStyle = 'black';
		ctx.moveTo(20, 20);
		ctx.lineTo(20, 380);
		ctx.stroke();

		physics();
	}
	setInterval(draw, 1);
}
