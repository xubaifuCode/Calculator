var memory = null;
var tree = new ExpressionTree();
function $(elemId) {
	return document.getElementById(elemId);
}
function press_key(elem) {
	var key_value = elem.innerHTML;
	var exp = $("show_expression").innerHTML;
	var res = $("show_result").innerHTML;

	if (key_value == "Clear") {
		$("show_expression").innerHTML = $("show_result").innerHTML = "0";
	} else if (key_value == "GetM") {
		$("show_expression").innerHTML = memory;
	} else if (key_value == "NewM") {
		memory = parseFloat(res);
		$("show_expression").innerHTML = 0;
	} else if (key_value == "MPlus") {
		memory = parseFloat(res) + (memory == null ? 0 : memory);
		$("show_result").innerHTML = memory;
	} else if (key_value == "Back") {
		var str = $("show_expression").innerHTML = exp.length > 1 ? exp.substr(0, exp.length - 1) : "0";
		processStr(str);
	} else if (key_value == "CM") {
		memory = 0;
	} else if (key_value == "M*") {
		memory = parseFloat(res) * (memory == null ? 1 : memory)
		$("show_result").innerHTML = memory;
	} else if(key_value == "=") {
		if (res != "0") {	return;	}
		processStr(exp);
	} else if (key_value == "+" || key_value == "-" || key_value == "/" || key_value == "*") {
		//If res is not zero means that it already has get the result.
		var str = res == "0" ? exp : res;
		var reg = /\d$/;
		//if before the new operator also is a operator, replace it, else add to its end.
		str = $("show_expression").innerHTML = !reg.test(str) ? str.substr(0, str.length - 1) + key_value : exp + key_value;
		//Just for fun
		processStr(str);
	} else if(/\d/.test(key_value)) {
		var str = exp;
		//It will be zero at first then we need to delete the single zero.
		str = str == "0" ?  "" : str;
		str = $("show_expression").innerHTML = str + key_value;
		//Just for fun
		processStr(str);
	} else if (key_value == "+/-") {
		//End with operator and before the operation is a number
		var reg1 = /\d[\+\-\*/]$/;
		//End with minues and before the minues is a operator
		var reg2 = /[\+\-\*/]?-$/;
		if (exp == "0" || exp.length == 0) {
			exp = "-";
		} else if (reg1.test(exp)) {
			exp += "-";
		} else if (reg2.test(exp)) {
			exp = exp.substr(0, exp.length - 1);
		}
		$("show_expression").innerHTML = exp;
	} else if (key_value == ".") {
		//Check if it end with a operator
		var reg1 = /[\+\-\*/]$/;
		//Check if it end with a number and has had a point.
		var reg2 = /[\+\-\*/]?\d*\.{1}\d*$/;
		if(!reg1.test(exp) && !reg2.test(exp)) {
			$("show_expression").innerHTML += key_value;
		}
	}
}

function processStr(str) {
	res = tree.getResult(str);
	res = isNaN(res) ? 0 : res;
	$("show_result").innerHTML = res;
	return res;
}

function ExpressionTree() {
	var thisRoot = null;

	this.getResult = function(str) {
		thisRoot = construct(str);
		return isNaN(thisRoot) ? computeTree(thisRoot) : thisRoot;
	}
	
	var Node = function(ch) {
		this.ch = ch;
		this.left = null;
		this.right = null;
	}

	var construct = function(str) {
		var reg = /([\+\-\*/]{1}-?)$/;
		str = reg.test(str) ? str.replace(reg, "") : str;
		var numList = parseStrToGetNum(str);
		var operList = parseStrToGetOper(str);
		return numList.length() == 1 ? numList.get(0) : generateTree(numList, operList);
	}

	//Parse the numers in String.
	var parseStrToGetNum = function(str) {
		var tList = new MyList();
		var reg = /[\+\-\*/]?(-?\d+\.?\d*)/g;
		var r;
		while(r = reg.exec(str)) {
			tList.add(parseFloat(r[1]));
		}
		return tList;
	}

	//Parse the operations in String.
	var parseStrToGetOper = function(str) {
		var tList = new MyList();
		var reg = /([\+\-\*/])-?/g;
		var r;
		while(r = reg.exec(str)) {
			tList.add(r[1]);
		}
		return tList;
	}

	var generateTree = function(numList, operList) {
		var nLen = numList.length();
		var oLen = operList.length();

		if (nLen == 0 || oLen == 0 || (nLen - 1) != oLen) {
			return false;
		}

		var tNode = null, tParent = null;
		var ch;
		for (var i = 0; i < oLen; i++) {
			ch = operList.get(i);
			if (ch == '+' || ch == '-') {
				tParent = new Node(ch);
				tParent.left = tNode == null ? new Node(numList.get(i)) : tNode;
				tParent.right = generateRightChild(numList, operList, oLen, i + 1);
				tNode = tParent;
			} else if (i == 0) {
				tNode = tParent = generateRightChild(numList, operList, oLen, i);
			}
		}

		return tParent;
	}

	var generateRightChild = function(numList, operList, oLen, index) {
		var ch = operList.get(index);
		if (ch == '+' || ch == '-' || index == oLen) {
			return new Node(numList.get(index));
		}
		var tParent = null, tNode = null;
		for (var i = index; i < oLen; i++) {
			ch = operList.get(i);
			if (ch == '*' || ch == '/') {
				tParent = new Node(ch);
				tParent.left = tNode == null ? new Node(numList.get(i)) : tNode;
				tParent.right = new Node(numList.get(i + 1));
				tNode = tParent;
			} else {
				break;
			}
		}
		return tParent;
	}

	var computeTree = function(currRoot) {
		var left, right, result = 0;
		if (currRoot == null) {
			return result;
		}
		left = computeTree(currRoot.left);
		right = computeTree(currRoot.right);
		//Type of float might cause error, change it to integer is fine.
		var powNum = Math.pow(10, Math.max(getPointLen(left), getPointLen(right)));
		left *= powNum;
		right *= powNum;
		switch(currRoot.ch) {
			case '+':
				result = left + right;
				break;
			case '-':
				result = left - right;
				break;
			case '*':
				result = left * right;
				break;
			case '/':
				result = left / right;
				break;
			default:
				return currRoot.ch;
		}
		return result / powNum;
	}

	var getPointLen = function(num) {
		var str = num.toString();
		var index = str.indexOf(".") + 1;
		return index == 0 ? index : str.length - index;
	}
}

function MyList() {
	var elems = new Array();
	var eIndex = 0;
	this.add = function(elem) {
		elems[eIndex++] = elem;
	}
	this.get = function(index) {
		return elems[index];
	}
	this.length = function() {
		return eIndex;
	}
	this.reCreate = function() {
		eIndex = 0;
	}
	this.toFloat = function(index) {
		return parseFloat(elems[index]);
	}
	this.show = function() {
		var str = "";
		for (var i = 0; i < eIndex; i++) {
			str += elems[i] + (i != eIndex - 1 ? "__" : "");
		}
		alert(str);
	}
}