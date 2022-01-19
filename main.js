window.addEventListener("load",main,false);//подключаем скрипт

function main() {
	let ctx		= example.getContext("2d");

	let	N;

	let	k		= 1000;   //коэф. жесткости
	let period 	= Math.sqrt(k);
	let	dt 		= 0.01;  //переменная интегрироваания сделать 1/20 периода колебаний

	let	F_x 	= [];
	let	F_y 	= [];

	let F_pres_x = [];
	let	F_pres_y = [];

	let v_y 	= [];
	let v_x 	= [];

	let	x       = [];
	let	y     	= [];

	let l		= 0;

	let	Radius  = 4;
	let phi;

	let s0;

	function init() {
		N = 35;//document.getElementById("NumberElements").value;
		phi     = 2 * Math.PI / N;

		let xStartVelocity = document.getElementById("xVelocity").value;
		let yStartVelocity = document.getElementById("yVelocity").value;

		for (let i = 0; i < N; i++) {
			x.push(Radius * Math.cos(phi * i));
			y.push(Radius * Math.sin(phi * i));
			v_y.push(0.1);
			v_x.push(-0.4);
			F_pres_x.push(0);
			F_pres_y.push(0);
		}

		l = Math.sqrt(Math.pow((x[1] - x[0]),2) + Math.pow((y[1] - y[0]),2));
		s0 		 = Square();
	}

	function Elastic_forces(k1, k2, k3) {
		let	dl_right;
		let	dl_left;
		let	F_l_y;
		let	F_r_y;

		let	F_l_x;
		let	F_r_x;

		let	cos_l;
		let	cos_r;
		let	sin_l;
		let	sin_r;

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


/*
	function Pressure() {
		let k_pres = -35;
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
		}
	}
	*/
	function Pressure_v2() {
		let k_pres = -0.005;

		let sq = Square(); //площадь в текущий момент
		let length;
		let normal_x;
		let normal_y;

		/*length = Math.sqrt(Math.pow((x[0] - x[1]), 2) + Math.pow((y[0] - y[1]), 2));
		normal_x = 1/2 * -(y[0] - y[1]) / length;
		normal_y = 1/2 * (x[0] - x[1]) / length;
		F_pres_x[1] = k_pres * (sq / s0 - 1) * normal_x;
		F_pres_y[1] = k_pres * (sq / s0 - 1) * normal_y;

		F_pres_x[0] = k_pres * (sq / s0 - 1) * normal_x;
		F_pres_y[0] = k_pres * (sq / s0 - 1) * normal_y;*/

		let pressureConst = k_pres * (sq / s0 - 1);

		for (let i = 1; i < N; i++) {
			length = Math.sqrt(Math.pow((x[i-1] - x[i]), 2) + Math.pow((y[i-1] - y[i]), 2));

			normal_x = -(y[i-1] - y[i]) / length;
			console.log(normal_x);
			normal_y = (x[i-1] - x[i]) / length;

			F_pres_x[i] += k_pres * (sq / s0 - 1) * normal_x;
			F_pres_y[i] += k_pres * (sq / s0 - 1) * normal_y;
			F_pres_x[i-1] += k_pres * (sq / s0 - 1) * normal_x;
			F_pres_y[i-1] += k_pres * (sq / s0 - 1) * normal_y;
		}

		length = Math.sqrt(Math.pow((x[N-1] - x[0]), 2) + Math.pow((y[N-1] - y[0]), 2));

		normal_x = -(y[N-1] - y[0]) / length;
		normal_y = (x[N-1] - x[0]) / length;

		F_pres_x[N-1] += k_pres * (sq / s0 - 1) * normal_x;
		F_pres_y[N-1] += k_pres * (sq / s0 - 1) * normal_y;
		F_pres_x[0] += k_pres * (sq / s0 - 1) * normal_x;
		F_pres_y[0] += k_pres * (sq / s0 - 1) * normal_y;

		//console.log(pressureConst);
		/*
		F_pres_x[N-1] = -F_pres_x[N-2] + F_pres_x[0];
		F_pres_y[N-1] = -F_pres_y[N-2] + F_pres_y[0];

		F_pres_x[0] = F_pres_x[0] + F_pres_x[N-1];
		F_pres_y[0] = F_pres_y[0] + F_pres_y[N-1];*/

	}

	function physics() {
		let F_elast = [];

		F_elast[0] = Elastic_forces(N-1, 0, 1);
		for (let i = 1; i < N - 1; i++) {
			F_elast[i] = Elastic_forces(i-1, i, i+1);
		}
		F_elast[N-1] = Elastic_forces(N - 2, N - 1, 0);

		Pressure_v2();

		for (let i = 0; i < N; i++) {
			F_y[i] = -F_elast[i][3] + F_elast[i][1] + F_pres_y[i] + LennardJhones(-9 - y[i]) - LennardJhones(9 - y[i]);
			F_x[i] = F_elast[i][0] - F_elast[i][2] + F_pres_x[i] + LennardJhones(-9 - x[i]) - LennardJhones(9 - x[i]);

			v_y[i] += F_y[i] * dt;
			y[i] += v_y[i] * dt;
			v_x[i] += F_x[i] * dt;
			x[i] += v_x[i] * dt;
		}
	}

	function LennardJhones(r) {
		let sigma 	= 0.2;
		let epsilon = 0.5;
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
			ctx.arc(200 + x[i] * 20, 200 + y[i] * 20, 2.5, 0, 2*Math.PI);
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

		ctx.beginPath();
		ctx.strokeStyle = 'black';
		ctx.moveTo(380, 20);
		ctx.lineTo(380, 380);
		ctx.stroke();

		ctx.beginPath();
		ctx.strokeStyle = 'black';
		ctx.moveTo(20, 380);
		ctx.lineTo(380, 380);
		ctx.stroke();

		ctx.beginPath();
		ctx.strokeStyle = 'black';
		ctx.moveTo(20, 20);
		ctx.lineTo(380, 20);
		ctx.stroke();

		physics();
	} 

	let timer;

	function drawOnClick() {
		/*let flag = document.getElementById("NumberElements").value;
		if (flag == "") {
			alert("Введите число элементов");
		} else {
			if (flag < 20 || flag > 80) {
				alert("Введите число в заданных границах");
			} else {*/
				init();
				timer = setInterval(draw, 1);
			//}
		//}
	}

	let startButton = document.getElementById("StartButton");
	let pauseButton = document.getElementById("PauseButton");
	let clearButton = document.getElementById("ClearButton");

	startButton.onclick = drawOnClick;

	function pauseOnClick() {
		clearInterval(timer);		
	}

	pauseButton.onclick = pauseOnClick;

	function clearOnClick() {
		clearInterval(timer);	
		x = [];
		y = [];
		v_x = [];
		v_y = [];

		ctx.beginPath();
		ctx.fillStyle = 'white';
		ctx.rect(0, 0, 400, 400);
		ctx.fill();
	}

	clearButton.onclick = clearOnClick;
}




