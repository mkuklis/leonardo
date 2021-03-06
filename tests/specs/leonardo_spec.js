describe("Leonardo", function () {
  var paper = Leonardo(200, 200, 1000, 1000);

  beforeEach(function () {
    this.addMatchers(LeonardoMatchers);
  });

  describe("#rectangle", function () {
    it("can draw rectangle", function () {
      var r = {x: 250, y: 250, w: 250, h: 250};
      var rect = paper.rect(r.x, r.y, r.w, r.h);
      expect(rect).toBeRectangle(r);
    });
  });

  describe("#circle", function () {
    it("can draw circle", function () {
      var c = {x: 100, y: 100, r: 100};
      var circle = paper.circle(c.x, c.y, c.r);
      expect(circle).toBeCircle(c);
    });
  });

  describe("#path", function () {
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
  });

  describe("#image", function () {
    it("can render image", function () {
      var assets = 'assets/img.jpg';
      var image = paper.image(assets, 100, 300, 100, 100);
      expect(image.attrs.src).toEqual(assets);
    });
  });

  describe("#clear", function () {
    it("can clear paper", function () {
      var c = {x: 50, y: 50, r: 10};
      var circle = paper.circle(c.x, c.y, c.r);
      var size = paper.elements.length;
      expect(paper.getPxColor(c.x + c.r, c.y)).toBe("#000000");
      paper.clear();
      expect(paper.elements.length).toBe(size);
      expect(paper.getPxColor(c.x + c.r, c.y)).toBe("#ffffff");
    });
  });

  describe("#reset", function () {
    it("can reset paper", function () {
      paper.circle(c.x, c.y, c.r).drag();
      expect(paper.events.mousedown.length).not.toBe(0);
      expect(paper.elements.length).not.toBe(0);
      paper.reset();
      expect(paper.elements.length).toBe(0);
      expect(paper.events.mousedown.length).toBe(0);
    });
  });

  describe("#getPos", function () {
    it("returns position", function () {
      sinon.spy(paper, "getPos");
      var circle = paper.circle(300, 300, 50).click();
      var e = simulate(paper.canvas, 'click', {pointerX: 200, pointerY: 200});
      expect(paper.getPos).toHaveBeenCalledWith(e);
      expect(paper.getPos.returnValues[0]).toEqual({x:0, y: 0});
      paper.getPos.restore();
    });
  });

  describe("#on", function () {
    beforeEach(function () {
      paper.reset();
      sinon.spy(paper, "on");
    });

    afterEach(function () {
      paper.on.restore();
    });

    it ("adds click event", function () {
      var circle = paper.circle(300, 300, 50).click();
      expect(paper.on).toHaveBeenCalledWith('click', circle);
      expect(paper.events.click.length).toBe(1);
      expect(paper.events.click[0]).toBe(circle);

      var circle = paper.circle(200, 200, 50).click();
      expect(paper.events.click.length).toBe(2);
    });

    it ("adds dragstart, dragmove, dragend events", function () {
      var circle = paper.circle(300, 300, 50).drag();
      expect(paper.on).toHaveBeenCalledWith('dragstart', circle);
      expect(paper.on).toHaveBeenCalledWith('dragmove', circle);
      expect(paper.on).toHaveBeenCalledWith('dragend', circle);

      expect(paper.events.mousedown.length).toBe(1);
      expect(paper.events.mousemove.length).toBe(1);
      expect(paper.events.mouseup.length).toBe(1);
    });

    it ("adds mousemove for mouseover event", function () {
      var circle = paper.circle(300, 300, 50).mouseover();
      expect(paper.on).toHaveBeenCalledWith('mouseover', circle);
      expect(paper.events.mousemove.length).toBe(1);
    });

    it ("adds mousemove for mouseout event", function () {
      var circle = paper.circle(300, 300, 50).mouseout();
      expect(paper.on).toHaveBeenCalledWith('mouseout', circle);
      expect(paper.events.mousemove.length).toBe(1);
    });

    it ("adds mousedown for mousedown event", function () {
      var circle = paper.circle(300, 300, 50).mousedown();
      expect(paper.on).toHaveBeenCalledWith('mousedown', circle);
      expect(paper.events.mousedown.length).toBe(1);
    });

    it ("adds mouseup event", function () {
      var circle = paper.circle(300, 300, 50).mouseup();
      expect(paper.on).toHaveBeenCalledWith('mouseup', circle);
      expect(paper.events.mouseup.length).toBe(1);
    });
  });

  describe("#off", function () {
    beforeEach(function () {
      paper.reset();
      sinon.spy(paper, "off");
    });

    afterEach(function () {
      paper.off.restore();
    });

  });
});
