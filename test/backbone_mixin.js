/*global describe, it, beforeEach */
'use strict';
var chai = require('chai');
var expect = chai.expect;

var Backbone = require('backbone');
var backboneMixin = require('../mixins/backbone');

var React = require('react');
var ID_RE='data-reactid="[^"]+"';
var CHECKSUM_RE='data-react-checksum="[^"]+"';

function RE(string) {
  return new RegExp(string);
}
var BonedComponent = React.createClass({
  mixins: [backboneMixin],
  render: function() {
    return React.DOM.span({ref: 'inner'},this.props.model.get('color'));
  }
});
var BonedListComponent = React.createClass({
  render: function() {
    var items = this.props.collection.map(function(item) {
      return React.DOM.li({key: item.get('cid')},item.get('name'));
    });
    return React.DOM.ul({ref: 'list'},items);
  }
});

describe('Backbone Mixin', function() {
  var model, component, collection, listComponent;
  beforeEach(function() {
    model = new Backbone.Model({color: 'red'});
    component = BonedComponent({model: model});

    collection = new Backbone.Collection([
      new Backbone.Model({name: 'Alice'}),
      new Backbone.Model({name: 'Bob'})
    ]);

    listComponent = BonedListComponent({collection: collection});
  });

  it('allows rendering', function(done) {
    React.renderComponentToString(component, function(html) {
      expect(html).to.match(RE('<span ' + ID_RE + ' ' + CHECKSUM_RE + '>red</span>'));
      done();
    });
  });

  it('updates when model changes', function (done) {
    React.renderComponentToString(component, function(html) {
      expect(html).to.match(RE('<span ' + ID_RE + ' ' + CHECKSUM_RE + '>red</span>'));
      model.set('color', 'blue');
      React.renderComponentToString(component, function(html) {
        expect(html).to.match(RE('<span ' + ID_RE + ' ' + CHECKSUM_RE + '>blue</span>'));
        done();
      });
    });
  });

  it('allows collection rendering', function(done) {
    React.renderComponentToString(listComponent, function(html) {
      expect(html).to.match(RE('<ul ' + ID_RE + ' ' + CHECKSUM_RE + '>' +
        '<li ' + ID_RE + '>Alice</li>' +
        '<li ' + ID_RE + '>Bob</li>' +
      '</ul>'));
      done();
    });
  });

  it('updates on collection events');
  it('updates when a model changes');
});
