describe("Leonardo", function () {
  var paper = Leonardo(200, 200, 1000, 1000);

  beforeEach(function () {
    //paper.clear();
  });

  it("can draw rectangle", function () {
    var rect = paper.rect(250, 250, 100, 100);
    expect(rect.attrs.x).toEqual(250);
    expect(rect.attrs.y).toEqual(250);
    expect(rect.attrs.w).toEqual(100);
    expect(rect.attrs.h).toEqual(100);
    expect(paper.getPxColor(250, 250)).toBe("#000000");
  });

  it("can draw circle", function () {
    var circle = paper.circle(100, 100, 100);
    expect(circle.attrs.x).toEqual(100);
    expect(circle.attrs.y).toEqual(100);
    expect(circle.attrs.r).toEqual(100);
  });

  it("can draw line", function () {
    var path = [{M: [200, 0], L: [300, 250]}];
    var line = paper.path(path);
    expect(line.attrs.path).toEqual(path);
  });

  it("can draw vertical line", function () {
    var path = [{M: [20, 20], V: 200}];
    var line = paper.path(path);
    expect(line.attrs.path).toEqual(path);
  });

  it("can draw horizontal line", function () {
    var path = [{M: [20, 20], H: 200}];
    var line = paper.path(path);
    expect(line.attrs.path).toEqual(path);
  });

  it("can draw quadratic curve", function () {
    var path = [{M:[75, 25]},
        {Q:[25,25,25,62.5, 25,100,50,100, 50,120,30,125, 60,120,65,100, 125,100,125,62.5, 125,25,75,25]}];
    var line = paper.path(path);
    expect(line.attrs.path).toEqual(path);
  });

  it("can draw bezier curve", function () {
   var path = [
        {M:[75, 40]},
        {B:[75,37,70,25,50,25, 20,25,20,62.5,20,62.5,
            20,80,40,102,75,120, 110,102,130,80,130,62.5,
            130,62.5,130,25,100,25, 85,25,75,37,75,40]}];

    var line = paper.path(path);
    expect(line.attrs.path).toEqual(path);
  });

  it("can render image", function () {
    var assets = 'assets/img.jpg';
    var image = paper.image(assets, 100, 300, 100, 100);
    expect(image.attrs.src).toEqual(assets);
  });

});
