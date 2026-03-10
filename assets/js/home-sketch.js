(function initHomeSketch() {
  var container = document.getElementById("home-p5-wrap");
  if (!container || typeof p5 === "undefined") return;

  new p5(function (p) {
    var particles = [];
    var particleCount = 140;

    var pointer = {
      x: 0,
      y: 0,
      px: 0,
      py: 0,
      speed: 0,
      active: false,
      lastMoveTime: 0,
    };

    var fieldVisibility = 0;
    var idleFadeDelay = 180;
    var fadeInSpeed = 0.08;
    var fadeOutSpeed = 0.025;

    var maxInfluenceRadius = 160;
    var baseDrift = 0.22;
    var noiseScale = 0.0025;
    var trailAlpha = 26;

    function Particle() {
      this.reset(true);
    }

    Particle.prototype.reset = function (randomizeDepth) {
      this.x = p.random(p.width);
      this.y = p.random(p.height);
      this.px = this.x;
      this.py = this.y;

      this.seed = p.random(1000);
      this.size = p.random(1.2, 4.2);

      this.vx = p.random(-0.15, 0.15);
      this.vy = p.random(-0.15, 0.15);

      this.life = p.random(0.3, 1);
      this.depth = randomizeDepth ? p.random(0.35, 1) : this.depth;
      this.wander = p.random(0.4, 1.1);
      this.brightness = p.random(160, 255);
      this.strokeWeight = p.random(0.35, 1.1);
    };

    Particle.prototype.update = function (t) {
      this.px = this.x;
      this.py = this.y;

      var n = p.noise(
        this.x * noiseScale * this.depth,
        this.y * noiseScale * this.depth,
        t * 0.00018 + this.seed,
      );

      var angle = n * p.TWO_PI * 4;
      this.vx += p.cos(angle) * 0.012 * this.wander;
      this.vy += p.sin(angle) * 0.012 * this.wander;

      this.vx *= 0.985;
      this.vy *= 0.985;

      this.x += this.vx + p.random(-baseDrift, baseDrift) * 0.08;
      this.y += this.vy + p.random(-baseDrift, baseDrift) * 0.08;

      if (pointer.active && fieldVisibility > 0.01) {
        var dx = this.x - pointer.x;
        var dy = this.y - pointer.y;
        var dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxInfluenceRadius && dist > 0.0001) {
          var force = 1 - dist / maxInfluenceRadius;
          var speedBoost = p.constrain(pointer.speed * 0.06, 0, 8);
          var push = force * (0.7 + speedBoost) * this.depth;

          this.vx += (dx / dist) * push * 0.18;
          this.vy += (dy / dist) * push * 0.18;

          var swirl = force * 0.22;
          this.vx += (-dy / dist) * swirl;
          this.vy += (dx / dist) * swirl;

          this.life = p.min(1.2, this.life + force * 0.04);
        }
      }

      this.life *= 0.996;
      this.life = p.max(0.16, this.life);

      if (
        this.x < -40 ||
        this.x > p.width + 40 ||
        this.y < -40 ||
        this.y > p.height + 40
      ) {
        this.reset(false);

        if (this.x < -40) this.x = p.width + p.random(10);
        if (this.x > p.width + 40) this.x = p.random(-10);
        if (this.y < -40) this.y = p.height + p.random(10);
        if (this.y > p.height + 40) this.y = p.random(-10);

        this.px = this.x;
        this.py = this.y;
      }
    };

    Particle.prototype.draw = function () {
      var alpha = this.life * fieldVisibility * 255;
      if (alpha < 1) return;

      var dx = this.x - this.px;
      var dy = this.y - this.py;
      var motion = Math.sqrt(dx * dx + dy * dy);

      p.stroke(this.brightness, alpha * 0.8);
      p.strokeWeight(this.strokeWeight);

      if (motion > 0.12) {
        p.line(this.px, this.py, this.x, this.y);
      } else {
        p.noStroke();
        p.fill(this.brightness, alpha * 0.5);
        p.rect(this.x, this.y, this.size * 0.65, this.size * 0.65);
      }
    };

    function buildParticles() {
      particles = [];
      for (var i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    }

    function syncContainerSize() {
      var rect = container.getBoundingClientRect();
      var w = Math.max(1, Math.floor(rect.width));
      var h = Math.max(320, Math.floor(rect.height));
      p.resizeCanvas(w, h);
      buildParticles();
      p.background(0);
    }

    function updatePointerFromEvent(event) {
      var rect = container.getBoundingClientRect();

      pointer.px = pointer.x;
      pointer.py = pointer.y;
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;

      var dx = pointer.x - pointer.px;
      var dy = pointer.y - pointer.py;
      pointer.speed = Math.sqrt(dx * dx + dy * dy);

      pointer.active = true;
      pointer.lastMoveTime = p.millis();
    }

    p.setup = function () {
      var rect = container.getBoundingClientRect();
      var w = Math.max(1, Math.floor(rect.width));
      var h = Math.max(320, Math.floor(rect.height));

      var canvas = p.createCanvas(w, h);
      canvas.parent(container);

      p.pixelDensity(Math.min(window.devicePixelRatio || 1, 1.5));
      p.background(0);
      buildParticles();

      container.addEventListener("pointermove", updatePointerFromEvent);

      container.addEventListener("pointerleave", function () {
        pointer.active = false;
      });

      window.addEventListener("resize", function () {
        syncContainerSize();
      });
    };

    p.draw = function () {
      var isHomeVisible =
        document.getElementById("home") &&
        document.getElementById("home").classList.contains("active");

      if (!isHomeVisible) {
        p.clear();
        return;
      }

      var now = p.millis();
      var idleTime = now - pointer.lastMoveTime;
      var shouldShow = pointer.active || idleTime < idleFadeDelay;

      if (shouldShow) {
        fieldVisibility += (1 - fieldVisibility) * fadeInSpeed;
      } else {
        fieldVisibility += (0 - fieldVisibility) * fadeOutSpeed;
      }

      fieldVisibility = p.constrain(fieldVisibility, 0, 1);

      p.noStroke();
      p.fill(0, trailAlpha);
      p.rect(0, 0, p.width, p.height);

      if (fieldVisibility < 0.003) {
        p.background(0);
        return;
      }

      var t = p.millis();

      for (var i = 0; i < particles.length; i++) {
        particles[i].update(t);
        particles[i].draw();
      }

      pointer.speed *= 0.9;
    };
  });
})();
