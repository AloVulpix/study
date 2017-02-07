/*
流程：
1、先劫持每个属性的getter和setter
2、遍历所有html标签，给每个v-model都注册一个watcher,
	注册的时候，会触发一次get（很巧妙），在这次get里面，
	把watcher添加到observer的list中，也把observer对应的dep添加到watcher里面，
	这样，就相互关联起来了。

3、每当data修改，触发setter，通知这个属性对应的watcher修改其对应的html标签

总结：observer对应js的data，watcher对应html的标签，通过观察者模式，实现MVVM
	巧妙之处在于，注册watcher的时候，通过getter找到对应data属性的getter和setter

*/

//这个是每个属性独有的dep，用来保存这个属性所对应的v-text的那些Watcher
var uid = 0
function Dep(){
	this.id = uid++;
	this.subs = []
};

Dep.prototype = {
	addSub: function(sub){
		this.subs.push(sub)
	},
	notify: function(){
		this.subs.forEach(function(sub){
			sub.update();
		})
	},
	addDep: function(){
		Dep.target.addDep(this);
	}
}

Dep.target = null;

var data = {
	child: {
		str: 'old'
	}
};

//这个是每个含有v-text标签所对应的Watcher，里面的depIds保存影响它的Observer的dep
function Watcher(data, exp, fn){
	this.$data = data;
	this.$exp = exp;
	this.depIds = [];
	this.fn = fn;
	this.value = this.getVMVal();
}

Watcher.prototype.getVMVal = function(){
	Dep.target = this;

	var arr = this.$exp.split('.');
	var value = this.$data;
	arr.forEach(function(k){
		value = value[k]
	});

	Dep.target = null;

	return value;
};

Watcher.prototype.addDep = function(dep){
	if (!this.depIds.hasOwnProperty(dep.id)) {
        dep.addSub(this);
        this.depIds[dep.id] = dep;
    }
}

Watcher.prototype.update = function(){
	var value = this.getVMVal();
    var oldVal = this.value;
    if(value != oldVal){
    	this.fn();
    }
}

observe(data);

document.getElementsByTagName('input')[0].addEventListener('input', function(e) {
    var newValue = e.target.value;
    var val = data.child.str;

    if (val === newValue) {
        return;
    }

    data.child.str = newValue;
});

var input = new Watcher(data, 'child.str', function(){
	var arr = document.getElementsByTagName('span');
	for(let i = 0; i < arr.length; i++){
		if(arr[i].hasAttribute('v-text')){
			arr[i].textContent = data.child.str;
		}
	}
});

var content = new Watcher(data, 'child.str', function(){

})

//observer用来修改每个属性的getter和setter
function observe(data){
	if (!data || typeof data !== 'object') {
        return;
    }
	Object.keys(data).forEach(function(value, index, arr){
		defineReactive(data, value, data[value])
	})
};

function defineReactive(data, key, val){
	var dep = new Dep();
	observe(val);

	Object.defineProperty(data, key, {
		enumerable: true,
		configurable: false,
		get: function(){
			if(Dep.target){
				dep.addDep();
			}
			return val
		},
		set: function(newVal){
			if(val == newVal) return;
			console.log('new value!', val, '-->', newVal);
			val = newVal;
			dep.notify();
		}
	})
}
