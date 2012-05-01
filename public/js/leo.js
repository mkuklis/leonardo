$(function () {

  // leonardo examples
  var paper = leonardo('circle');
  paper.circle(50, 50, 25, {fill: '#FF7400'}).draw();

  var leo = leonardo('rect');
  var rect = leo.rect(25, 30, 40, 30, 0, {fill: '#247bc7'}).draw();

});
