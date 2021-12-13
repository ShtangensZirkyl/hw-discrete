window.addEventListener("load",main,false);//подключаем скрипт
	
function main() {
	
	var ctx=example.getContext("2d");

	var	N       = 50;

	let	dt 		= 0.01;  //переменная интегрироваания
	let	k		= 1;   //коэф. жесткости
	
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
		v_y.push(0);
		v_x.push(-1);
	}

	//v_x[1] = -1;
	let l = Math.sqrt(Math.pow((x[1] - x[0]),2) + Math.pow((y[1] - y[0]),2));

	/*function Length(){
		for (let i = 0; i < N-1; i++) {
			l0[i] 		= Math.sqrt(Math.pow((x[i] - x[i+1]),2) + Math.pow((y[i] - y[i+1]),2));
		}

		l0[N-1] = Math.sqrt(Math.pow((x[N-1] - x[0]),2) + Math.pow((y[N-1] - y[0]),2));
	}

	Length();

	console.log(l0);*/
	
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
		//cos_l 	= Math.abs((y[k2] - y[k1])) / dl_left;
		//sin_l 	= Math.abs((x[k2] - x[k1])) / dl_left;
		F_l_y 	= -k * (dl_left - l) * cos_l;
		F_l_x 	= -k * (dl_left - l) * sin_l;

		cos_r 	= ((y[k3] - y[k2])) / dl_right;
		sin_r 	= ((x[k3] - x[k2])) / dl_right;
		//cos_r 	= Math.abs((y[k3] - y[k2])) / dl_right;
		//sin_r 	= Math.abs((x[k3] - x[k2])) / dl_right;
		F_r_y 	= -k * (dl_right - l) * cos_r;
		F_r_x 	= -k * (dl_right - l) * sin_r;

		//console.log("i = " + k2 + ", dl_left - l = " + (dl_left - l) + ", dl_right - l= " + (dl_right - l));
		//console.log("i = " + k2 + ", f_l_x = " + F_l_x + ", f_l_y = " + F_l_y + ", f_r_x = " + F_r_x + ", f_r_y = " + F_r_y );
		return [F_l_x, F_l_y, F_r_x, F_r_y];
	}
	
	function Collision() {
		for (let i = 0; i < N; i++) {
			for (let j = i + 1; j < N; j++) {
					null
			}
		}
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

		return 1/2 * Math.abs(S1 + x[N-1] * y[1] - S2 + x[1] * y[N-1]);
	}

	function Sum(x, lower_bound, upper_bound) {
		let s = 0;
		for (let i = lower_bound; i < upper_bound; i++) {
			s += x[i];
		}
		return s;
	}

	function mass_center() {
		let x_mass_center = Sum(x, 0, N) / N;
		let y_mass_center = Sum(y, 0, N) / N;
		return [x_mass_center, y_mass_center];
	}

	let s0 		= Square();

	let F_pres_x = [];
	let	F_pres_y = [];

	function Pressure() {
		let k_pres = 6;
		let sin_p;
		let cos_p;
		let rad;
		let x_c = mass_center()[0];
		let y_c = mass_center()[1];

		for (let i = 0; i < N; i++) {
			rad = Math.sqrt(Math.pow((x[i] - x_c),2) + Math.pow((y[i] - y_c),2));
			cos_p = (x[i] - x_c) / rad;
			sin_p = (y[i] - y_c) / rad;

			F_pres_x[i] = -k_pres * (-1 + Square() / s0) * cos_p;
			F_pres_y[i] = -k_pres * (-1 + Square() / s0) * sin_p;
			console.log("F_pres_x = " + F_pres_x[i] + ", F_pres_y = " + F_pres_x[i]);
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
			F_x[i] = F_elast[i][0] - F_elast[i][2] + F_pres_x[i];

			v_y[i] += F_y[i] * dt;
			y[i] += v_y[i] * dt;
			v_x[i] += F_x[i] * dt;
			x[i] += v_x[i] * dt;
		}

		for (let i = 0; i < N; i++) {
			if (x[i]>10 || x[i]<-10) {
				v_x[i] = -v_x[i];
			}

			if (y[i]>10 || y[i]<-10) {
				v_y[i] = -v_y[i];
			}
		}
	}

	function draw() {
		for (let i = 0; i < N; i++) {
			ctx.beginPath();
			ctx.arc(200 + x[i] * 20, 200 + y[i] * 20, 5, 0, 2*Math.PI);
			ctx.fill();
		}	

		for (let i = 0; i < N; i++) {
			ctx.beginPath();
			ctx.fillStyle = 'white';
			ctx.arc(200 + x[i] * 20, 200 + y[i] * 20, 20, 0, 2*Math.PI);
			ctx.fill();
		}

		physics();

		for (let i = 0; i < N; i++) {
			ctx.beginPath();
			ctx.fillStyle = 'black';
			ctx.arc(200 + x[i] * 20, 200 + y[i] * 20, 4, 0, 2*Math.PI);
			ctx.fill();
		}
	}
	setInterval(draw, 10);
}
