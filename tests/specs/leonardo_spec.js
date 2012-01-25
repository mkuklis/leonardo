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

  it("can draw horizontal line", function () {
    var path = [{M: [20, 20], H: 200}];
    var line = paper.path(path);
    expect(line.attrs.path).toEqual(path);
  });

});
