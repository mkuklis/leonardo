$(function () {

  // leonardo examples
  var paper = leonardo('circle');
  paper.circle(50, 50, 25, {fill: '#FF7400'}).draw();

  var leo = leonardo('rect');
  var rect = leo.rect(25, 30, 40, 30, 0, {fill: '#247bc7'}).draw();

  var leo = leonardo('path');
  leo.path([
      {M: [75, 40]},
      {B: [75,37,70,25,50,25, 20,25,20,62.5,20,62.5,
          20,80,40,102,75,120, 110,102,130,80,130,62.5,
          130,62.5,130,25,100,25, 85,25,75,37,75,40]}]);

  leo.path([
    {M: [200, 30]},
    {Q: [300, 0, 288, 120]}]);

  var leo = leonardo('image');
  var image = leo.image("public/img/image.jpg", 10, 10, 90, 90);

});
