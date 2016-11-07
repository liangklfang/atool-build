'use strict';

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _class, _temp;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Parent = function Parent() {
  (0, _classCallCheck3.default)(this, Parent);

  console.log('Parent constructor');
  this.name = 'john';
};

var A = (_temp = _class = function (_Parent) {
  (0, _inherits3.default)(A, _Parent);

  function A() {
    (0, _classCallCheck3.default)(this, A);

    console.log('Child constructor');
    return (0, _possibleConstructorReturn3.default)(this, (A.__proto__ || (0, _getPrototypeOf2.default)(A)).call(this));
  }

  (0, _createClass3.default)(A, [{
    key: 'foo',
    value: function foo() {
      console.log('foo', this.name);
    }
  }], [{
    key: 'method',
    value: function method(obj) {
      console.log('method', obj);
    }
  }]);
  return A;
}(Parent), _class.propTypes = 1, _temp);


var a = new A();
a.foo();
A.method('haha');