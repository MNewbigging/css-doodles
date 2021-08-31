import { observable } from 'mobx';

export class Vec2 {
  constructor(public x = 0, public y = 0) {}
}

export class Particle {
  public age: number = 0;
  public lifespan: number; // no. of frames this particle is kept alive
  public position: Vec2;
  public velocity: Vec2;
  public rotation: number; // in degrees

  constructor(lifespan: number, position: Vec2, velocity: Vec2, rotation = 0) {
    this.lifespan = lifespan;
    this.position = position;
    this.velocity = velocity;
    this.rotation = rotation;
  }

  // Updates position and age of particle
  public update(dt: number) {
    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;
    this.age += dt;
  }
}

export class ParticlesState {
  public particles: Particle[] = [];
  private readonly canvas: HTMLCanvasElement;
  private readonly canvasCtx: CanvasRenderingContext2D;
  private readonly startPos: Vec2;
  private particleImage: HTMLImageElement;
  private readonly maxParticles = 1;
  private lastFrameTime: number;
  private addCounter: number = 0;
  private addDelay: number = 0.5;

  constructor(canvas: HTMLCanvasElement, startPos: Vec2) {
    this.canvas = canvas;
    this.canvasCtx = canvas.getContext('2d');
    this.startPos = startPos;

    // Setup the image for the particle
    // TODO - should be a parameter
    const image = new Image();
    image.src = window.location + '/src/particles/smoke_01.png';
    image.width = 2;
    image.height = 2;
    image.onload = () => {
      this.particleImage = image;
      this.lastFrameTime = performance.now();
      window.requestAnimationFrame(this.update);
    };
  }

  private update = (timestamp: number) => {
    // work out delta time
    const dt = (timestamp - this.lastFrameTime) / 1000;
    this.lastFrameTime = timestamp;
    this.addCounter += dt;

    // Clear canvas
    this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Do we need to add more particles?
    if (this.addCounter >= this.addDelay) {
      this.addParticle();
      this.addCounter = 0;
    }

    // Update and draw particles
    this.particles.forEach((p) => p.update(dt));

    // Clear out any dead particles
    this.removeDeadParticles();

    // Draw updated, remaining particles
    this.particles.forEach((p) => this.drawParticle(p));

    window.requestAnimationFrame(this.update);
  };

  private addParticle() {
    const lifespan = 5;
    const pos = new Vec2(this.startPos.x - 25, this.startPos.y - 25);
    const vel = new Vec2(0, -10);
    const rot = Math.floor(Math.random() * 360);

    const p = new Particle(lifespan, pos, vel, rot);

    this.particles.push(p);
  }

  private removeDeadParticles() {
    this.particles = this.particles.filter((p) => p.age < p.lifespan);
  }

  private drawParticle(particle: Particle) {
    if (!this.particleImage) {
      return;
    }

    const ctx = this.canvasCtx;

    ctx.save();

    // Translate context to origin of the particle
    ctx.translate(particle.position.x + 25, particle.position.y + 25);

    // Rotate context
    ctx.rotate((particle.rotation * Math.PI) / 180);

    // Fade in or out depending on age
    let alpha = 1;
    const remainingLife = particle.lifespan - particle.age;
    if (particle.age < 1) {
      alpha = particle.age;
    } else if (remainingLife < 1) {
      alpha = remainingLife;
    }
    ctx.globalAlpha = alpha;

    // Draw image - dx and dy are affected by above translation
    ctx.drawImage(this.particleImage, -25, -25, 50, 50);

    ctx.restore();
  }
}
