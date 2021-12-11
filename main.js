window.addEventListener("load",main,false);//подключаем скрипт
	
function main() {
	
	var ctx=example.getContext("2d");

	var	N       = 10;

	let t		= 0;     //время
		dt 		= 0.01;  //переменная интегрироваания
		k		= 0.1;   //коэф. жесткости
		b 		= 0.1;
	
	let v_y 	= [];
	let v_x 	= [];
	let	F_x 	= [];
	let	F_y 	= [];

		phi     = 2 * Math.PI / N;
		Radius  = 4;
	let	x       = [];
	let	y     	= [];

	for (let i = 0; i < N; i++) {
		x.push(Radius * Math.cos(phi * i));
		y.push(Radius * Math.sin(phi * i));
		v_y.push(0);
		v_x.push(-1);
	}

	//v_x[1] = -1;

	let l 		= Math.sqrt(Math.pow((x[1] - x[0]),2) + Math.pow((y[1] - y[0]),2));
	let l2 		= Math.sqrt(Math.pow((x[1] - x[2]),2) + Math.pow((y[1] - y[2]),2));
	let l3 		= Math.sqrt(Math.pow((x[2] - x[0]),2) + Math.pow((y[2] - y[0]),2));
	
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

		//cos_l 	= ((y[k2] - y[k1])) / dl_left;
		//sin_l 	= ((x[k2] - x[k1])) / dl_left;
		cos_l 	= Math.abs((y[k2] - y[k1])) / dl_left;
		sin_l 	= Math.abs((x[k2] - x[k1])) / dl_left;
		F_l_y 	= -k * (dl_left - l) * cos_l;
		F_l_x 	= -k * (dl_left - l) * sin_l;

		//cos_r 	= ((y[k3] - y[k2])) / dl_right;
		//sin_r 	= ((x[k3] - x[k2])) / dl_right;
		cos_r 	= Math.abs((y[k3] - y[k2])) / dl_right;
		sin_r 	= Math.abs((x[k3] - x[k2])) / dl_right;
		F_r_y 	= -k * (dl_right - l) * cos_r;
		F_r_x 	= -k * (dl_right - l) * sin_r;

		F_y[k2] 	= F_r_y - F_l_y;
		F_x[k2] 	= F_r_x - F_l_x;

		//console.log("l2 = " + l2 + ", l3 = " + l3 + ", l = " + l + ", i = " + i + ", dl_left-l = " +(dl_left-l) + ", dl_right-l = " +(dl_right-l) );

		//console.log("i = " + i + ", f_x = " + F_x[i] + ", f_y = " + F_y[i] + ", dl_left = " + (dl_left-l) );

		v_y[k2] 	+= F_y[k2] * dt;
		y[k2] 		+= v_y[k2] * dt;
		v_x[k2]  	+= F_x[k2] * dt;
		x[k2] 		+= v_x[k2] * dt;
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



	function physics() {

		Elastic_forces(N-1, 0, 1);
		for (let i = 1; i < N - 1; i++) {
			Elastic_forces(i-1, i, i+1);
		}
		Elastic_forces(N - 2, N - 1, 0);

		console.log(Square());

		for (i = 0; i < N; i++) {
			if (x[i]>10 || x[i]<-10) {
				v_x[i] = -v_x[i];
			}

			if (y[i]>10 || y[i]<-10) {
				v_y[i] = -v_y[i];
			}
		}
		//Collision();
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
