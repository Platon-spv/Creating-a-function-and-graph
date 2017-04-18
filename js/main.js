var distance = 150; //  - растояние между линиями px
var square = 25; //  - ширина квадрата px

if (window.File && window.FileReader && window.FileList && window.Blob) {} else {
	alert('File API не поддерживается данным браузером');
}

var input = document.querySelector("#input_file");
var btn = document.querySelector("#button");
btn.onclick = function() {
	input.click();
};


var table1 = [];
var table2 = [];
var dataStrings;
var stringValues;

var none = "";
var selectForT1 = "red";
var selectForT2 = "3px solid blue";
window.onload = function() {
	var fileInput = document.getElementById('input_file');
	var fileDisplayArea = document.getElementById('fileDisplayArea');

	fileInput.addEventListener('change', function(e) {
		var file = fileInput.files[0];
		var textType = /text.*/;

		if (file.type.match(textType)) {
			var reader = new FileReader();

			reader.onload = function(e) {

				parser(reader.result);
				calculateTable2();
				builderTable1();
				builderTable2();
				activateButtons();

				var mainFrame = document.getElementsByClassName('myframe');
				mainFrame[0].style.visibility = "visible";
			};

			reader.readAsText(file);

		} else {
			alert("Этот тип файлов не поддерживается.\nНужен текстовый файл.");
		}
	});
};



function parser(data) {
	console.log("Parser ready: ", data);
	dataStrings = data.split('\n'); // массив строк

	for (var i = 0; i < dataStrings.length; i++) { //разбираем на строки
		table1[i] = [];
		stringValues = dataStrings[i].split(';'); //разбираем каждую строку в массив занчений
		for (var j = 0; j < stringValues.length; j++) {
			if ((i > 0) && (j > 0)) {
				stringValues[j] = Number(stringValues[j].replace(/,/g, "."));
			}
			table1[i][j] = stringValues[j];
		}
	}
}

function calculateTable2() {
	var kmin, kmax;
	table2 = matrixArray(table1.length, table1[0].length)
		// ищем в каждом столбце kmin, kmax
	for (var j = 0; j < table1[0].length; j++) {
		kmin = kmax = table1[1][j];
		for (var i = 1; i < table1.length; i++) {
			if (NaN) {
				console.log('В ', j, ' столбце, ', i, 'ряду ошибка данных');
				continue;
			}

			if (table1[i][j] < kmin) {
				kmin = table1[i][j];
			}

			if (table1[i][j] > kmax) {
				kmax = table1[i][j];
			}
		}
		funcForTable2(kmin, kmax, j);
	}
}

function funcForTable2(kmin, kmax, j) {
	var k = kmax - kmin;
	for (i = 0; i < table1.length; i++) { // считаем таблицу
		if (isNaN(Number(table1[i][j]))) {
			table2[i][j] = table1[i][j]; // переписываем текстовые ячейки из table1 в table2
			continue;
		}

		table2[i][j] = (table1[i][j] - kmin) / k * 100;
		table2[i][j] = table2[i][j].toFixed(2);

	}

}

function builderTable1() {
	var table = document.getElementById('table1');
	var tbody = document.createElement('TBODY');
	for (var i = 0; i < table1.length; i++) {
		var tr = document.createElement('TR');
		tbody.appendChild(tr);
		for (var j = 0; j < table1[0].length; j++) {
			var td = document.createElement('td');
			td.className = "cell";
			tr.appendChild(td);
			td.appendChild(document.createTextNode('' + table1[i][j]));
		}
	}
	table.appendChild(tbody);
}


function builderTable2() {
	var table = document.getElementById('table2');
	var tbody = document.createElement('TBODY');

	for (var i = 0; i < table2.length; i++) {
		var tr = document.createElement('TR');
		tbody.appendChild(tr);
		for (var j = 0; j < table2[0].length; j++) {
			var td = document.createElement('td');
			td.className = "cell";
			if (!(!i || !j)) {
				td.style.backgroundColor = 'rgba(255, 0, 0,' + (table2[i][j] / 100).toString() + ')';
				td.style.cursor = 'pointer';

				td.onclick = function() {
					var row = this.parentElement.rowIndex;
					var ind = this.cellIndex;
					var t1 = document.getElementById('table1').rows[row].cells[ind];

					if (this.style.border) {
						this.style.border = none;
						t1.style.backgroundColor = none;

					} else {
						this.style.border = selectForT2;
						t1.style.backgroundColor = selectForT1;
					}
				};


			}
			tr.appendChild(td);
			td.appendChild(document.createTextNode('' + table2[i][j]));
		}
	}
	table.appendChild(tbody);
}

function activateButtons() {

	document.getElementById('bntSelectAll').onclick = function() {

		for (var i = 1; i < table1.length; i++) {
			for (var j = 1; j < table1[0].length; j++) {
				document.getElementById('table1').rows[i].cells[j].style.backgroundColor = selectForT1;
				document.getElementById('table2').rows[i].cells[j].style.border = selectForT2;
			}
		}

	};

	document.getElementById('bntDeselectAll').onclick = function() {

		for (var i = 1; i < table1.length; i++) {
			for (var j = 1; j < table1[0].length; j++) {
				document.getElementById('table1').rows[i].cells[j].style.backgroundColor = none;
				document.getElementById('table2').rows[i].cells[j].style.border = none;
			}
		}

	};


	document.getElementById('btnSend').onclick = function() {
		var m = makeMassiveForGraph();
		buildGraph(m);

	};
}


function makeMassiveForGraph() {
	var mass = [];
	var iList = [];
	var jList = [];
	var imin, imax, jmin, jmax;

	for (var i = 1; i < table1.length; i++) { // находим все выделенные элементы
		for (var j = 1; j < table1[0].length; j++) {
			if (document.getElementById('table1').rows[i].cells[j].style.backgroundColor) {
				iList[iList.length] = i;
				jList[jList.length] = j;
			}
		}
	}

	imax = Math.max.apply(null, iList);
	imin = Math.min.apply(null, iList);
	jmax = Math.max.apply(null, jList);
	jmin = Math.min.apply(null, jList);

	mass = matrixArray((imax - imin + 1), (jmax - jmin + 1));

	for (var n = 0; n < iList.length; n++) {
		i = iList[n];
		j = jList[n];

		mass[(i - imin)][(j - jmin)] = Number(table2[i][j]);

	}

	console.log("Значения попали в массив:" + mass);
	return mass;
}


function matrixArray(rows, cells) {
	var arr = [];
	for (var q = 0; q < rows; q++) {
		arr[q] = [];
		for (var w = 0; w < cells; w++) {
			arr[q][w] = null;
		}
	}
	return arr;
}


function buildGraph(mass) {

	if (mass[0] === undefined) {
		return;
	}

	var g = document.getElementById('graph');
	var step = distance; //шаг px
	var squareLength = square;
	var vlines = mass[0].length; //количество вертикальных линий
	console.log("vlines:", vlines);



	//находим мин и макс значения ВСЕГО МАССИВА
	var min, max, diff;
	var j = 0;
	while (mass[0][j] === null) {
		j++;
	}
	min = max = mass[0][j];


	for (var i = 0; i < mass.length; i++) {
		for (var j = 0; j < vlines; j++) {
			// if (min === null) {
			// 	min = max = mass[i][j];
			// 	console.log("dif (min === null) diff, min, max:", diff, min, max);
			// 	continue
			// }
			if (mass[i][j] === null) { // пропуск если пустое значение
				continue;
			};
			if (mass[i][j] > max) {
				max = mass[i][j];
			};
			if (mass[i][j] < min) {
				min = mass[i][j];
			};
		}
	}
	diff = max - min;
	console.log("ИТОГО diff, min, max:", diff, min, max);
	
	var shift = 100; //отсуп от оси по вертикали
	var scale = 8; // коэффициент растягивания по вертикали

	var canvWidth;
	var canvHeight;
	canvWidth = (vlines + 1) * step;
	canvHeight = diff * scale + 2 * shift; 

	g.height = canvHeight + 30;// +30px для цифр под графиком

	g.width = canvWidth;
	var c = g.getContext('2d');


	c.lineWidth = 2; 
	c.strokeStyle = "black";
	c.closePath();

	//рисуем оси координат
	c.beginPath();
	c.moveTo(canvWidth, canvHeight);
	c.lineTo(1, canvHeight);
	c.lineTo(1, 0);
	c.stroke();
	c.closePath();



	//рисуем вертикальные линии - "Y вертикальных линий" и подпись снизу
	c.beginPath();
	c.lineWidth = 1; // ширина
	c.font = "16px Arial";

	c.fillText("0", 0, canvHeight + 20);

	for (var a = 1; a <= vlines; a++) {
		c.moveTo(a * step + .5, 0);
		c.lineTo(a * step + .5, canvHeight);
		c.font = "16px Arial";
		c.fillText(a, a * step - 20, 20); //подписываем вертикальные линии
		c.fillText(a * 10, a * step, canvHeight + 20);

	}
	c.stroke();
	c.closePath();

	// слева от графика шкала с шагом 10
	var maxScale = Math.ceil(max / 10);
	var minScale = Math.floor(min / 10);
	var i = 0;
	console.log("maxScale, minScale", maxScale, minScale);
	for (var a = maxScale; a >= minScale; a--) {
		c.beginPath;
		c.fillText(a * 10, 10, i * scale * 10 + shift);
		c.moveTo(1, i * scale * 10 + shift);
		c.lineTo(10, i * scale * 10 + shift);
		c.stroke();
		i++;

	}


	//ищем точки одинаковые значения на линиях. Запишем в массив duplicates[j]=[n,t]
	// j - номер вертикальной линии
	// n - само число
	// t - количество найденых чисел
	var temp = [];
	var duplicates = [];
	var n, t;
	for (var j = 0; j < mass[0].length; j++) { // проход по вертикальным линиям
		duplicates[j] = [];
		// t = 0;
		for (var i = 0; i < mass.length; i++) { // ищем сверху-вниз
			if (mass[i][j] === null) {
				continue;
			}

			console.log("j, i,n ", j, i, n);

			if (inDuplicates(mass[i][j], duplicates[j])) { //проверка если повторы этого числа уже посчитаны - следующий цикл
				continue;
			}

			t = 0;
			for (var f = i; f < mass.length; f++) { // сам поиск
				if (mass[i][j] === mass[f][j]) {
					t++
				}
			}

			duplicates[j][duplicates[j].length] = [];
			n = mass[i][j];
			duplicates[j][duplicates[j].length - 1] = [n, t]; //  n-само число, t-кол-во этих чисел на вертикальной линии

		};

	}
	console.log("!!!! duplicates: ", duplicates);


	// конвертируем значения массива для отрисовки в координатах canvas
	for (var i = 0; i < mass.length; i++) {
		for (var j = 0; j < mass[0].length; j++) {
			if (mass[i][j] === null) { // пропуск если пустое значение
				continue;
			}
			mass[i][j] = (max - mass[i][j]) * scale + shift; //коэфф. растягивания + отсуп от оси по вертикали 

		}

	}
	console.log("converted mass: ", mass);



	// рисуем точки
	c.beginPath();
	for (var i = 0; i < mass.length; i++) {
		for (var j = 0; j < mass[0].length; j++) {

			if (mass[i][j] === null) { // пропуск если пустое значение
				continue;
			}
			c.moveTo(j * step + step, mass[i][j]);
			c.arc(j * step + step, (mass[i][j]), 5, 0, 2 * Math.PI);
		}
		c.fill();
		// рисуем линии соединения точек
		j = 0;
		while (mass[i][j] === null) {
			j++;
		}
		var lastNOTnullJ = j;
		for (var j = 1; j < mass[0].length; j++) {
			if (mass[i][j] === null) { // пропуск если пустое значение
				continue;
			}
			if (lastNOTnullJ === null) {
				lastNOTnullJ = mass[i][j]
			}
			c.beginPath();
			c.moveTo((lastNOTnullJ) * step + step, mass[i][lastNOTnullJ]);
			c.lineTo(j * step + step, mass[i][j], 5, 0, 2 * Math.PI);
			c.stroke();
			lastNOTnullJ = j;
		}
	}



	//находим kmin, kmax каждой вертикальной линии
	for (var i = 0; i < duplicates.length; i++) {
		if (duplicates[i][0] === undefined) { //если во всем ряду null
			continue;
		}
		var kmin = kmax = duplicates[i][0][1];

		for (var j = 1; j < duplicates[i].length; j++) {
			if (duplicates[i][j][1] > kmax) {
				kmax = duplicates[i][j][1]
			};
			if (duplicates[i][j][1] < kmin) {
				kmin = duplicates[i][j][1]
			};
		}
		console.log(" kmin, kmax : ", kmin, kmax)
			//расчитаем ширину квадрата по формуле
		if (kmin === kmax) {
			continue;
		};

		var k, y;

		for (var j = 0; j < duplicates[i].length; j++) {
			if (duplicates[i][j][1] === kmin) {
				continue;
			}; // если k=kmin
			k = (duplicates[i][j][1] - kmin) * (kmax - kmin) * squareLength; // squareLength - длина грани квадрата
			y = (max - duplicates[i][j][0]) * scale + shift - k / 2;

			//рисуем квадрат
			c.beginPath();
			c.strokeStyle = "black";
			c.strokeRect(i * step + step, y, k, k);
			console.log("рисуем квадрат: x,y,k", i * step + step, y, k);
			c.stroke();
		}
	}
	c.closePath();

}

function inDuplicates(num, m) {
	for (var i = 0; i < m.length; i++) {
		if (num === m[i][0]) {
			return true;
		}
	}
	return false;

};