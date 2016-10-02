'use strict';

var another = function another() {
	console.log('wow');
};

/* Something already here */
var another1 = function another1(value, isFirst) {
	console.log('wow');
};

var another2 = function another2() {
	console.log('wow');
};

var x = function x(one, two) {};

x = [1, 2, 3];
x = a.map(function () {
	return a * 2;
});

z = a.map(function () {
	return function () {
		return 'hello';
	};
});

q = function q(second, third) {
	return function () {
		console.log(1);
	};
};

c = function c() {};

function a() {}

b = function b() {};