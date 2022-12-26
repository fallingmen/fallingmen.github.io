function startMatter() {
    var canvas = document.getElementById('matter-canvas');

    var minWidth = 745;
    var minHeight = 700;
    var changeWidth = 1100;
    var verticalName = false;
    function resizeCanvas() {
        var aspectRatio = canvas.offsetWidth / canvas.offsetHeight;

        if (canvas.offsetWidth > minWidth && canvas.offsetHeight > minHeight) {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        } else if (canvas.offsetWidth < minWidth && canvas.offsetHeight > minHeight) {
            canvas.width = minWidth;
            canvas.height = minWidth / aspectRatio;
        } else if (canvas.offsetHeight < minHeight && canvas.offsetWidth > minWidth) {
            canvas.height = minHeight;
            canvas.width = minHeight * aspectRatio;
        } else {
            if (canvas.offsetWidth - minWidth > canvas.offsetHeight - minHeight) {
                canvas.height = minHeight;
                canvas.width = minHeight * aspectRatio;
            } else {
                canvas.width = minWidth;
                canvas.height = minWidth / aspectRatio;
            }
        }

        render.options.width = canvas.width;
        render.options.height = canvas.height;

        render.bounds.min.x = -canvas.width / 2;
        render.bounds.max.x = canvas.width / 2;
        var relativeNavbarSize = 60 * Math.max(canvas.height / canvas.offsetHeight, 1);
        render.bounds.min.y = (-canvas.height - relativeNavbarSize) / 2;
        render.bounds.max.y = (canvas.height - relativeNavbarSize) / 2;
    }

    var Engine = Matter.Engine,
        Render = Matter.Render,
        Events = Matter.Events,
        Composite = Matter.Composite,
        World = Matter.World,
        Bodies = Matter.Bodies,
        Body = Matter.Body,
        Sleeping = Matter.Sleeping;

    // create an engine
    var engine = Engine.create({
        enableSleeping: true,
    });

    // engine.world.gravity.y = 40

    Events.on(engine, 'collisionStart', function () {
        let sound = new Audio('/audio/ah.wav');
        sound.play();
    });

    // create a renderer
    var render = Render.create({
        canvas: canvas,
        engine: engine,
        options: {
            width: canvas.width,
            height: canvas.height,
            hasBounds: true,
            wireframes: false,
            showSleeping: false,
            background: 'transparent'
        }
    });

    var collisionRender = { visible: true };
    var floor = Bodies.rectangle(0, window.innerHeight * .45, 1000, 50, {
        isStatic: true,
        render: { visible: true,  },
    });

    var particles = [];
    setInterval(function () {
        if (!document.hidden) {
            var iconNum = Math.floor(Math.random() * 20);
            // try loading image
            loadImage(
                'img/miku.png',
                function (src) {
                    var particle = Bodies.circle(canvas.width * Math.random() - (canvas.width / 2), -(canvas.height * .7), 80, {
                        restitution: 1,
                        sleepThreshold: 10,
                        render: { sprite: { texture: src } }
                    });
                    particle.jumps = 0;
                    particles.push(particle);
                    Events.on(particle, 'sleepStart', function () {
                        particle.jumps++;
                        Sleeping.set(particle, false)
                        Body.applyForce(particle, particle.position, {
                            x: Math.random() - .5,
                            y: -.5,
                        });
                    });
                    World.add(engine.world, particle);
                }
            );
        }
    }, 400);

    Events.on(engine, 'beforeUpdate', function () {
        for (var i = 0; i < particles.length; i++) {
            if (particles[i].position.y > canvas.height * .6 || particles[i].jumps > 5) {
                World.remove(engine.world, particles.splice(i, 1)[0]);
                i--;

                let rand = Math.random() * 100;
                let sound = new Audio(rand < 1 ? '/audio/scream.wav' : '/audio/ahh.wav');
                sound.play();
            }
        }
    });

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    World.add(engine.world, [floor]);
    Engine.run(engine);
    Render.run(render);
}

function loadImage(src, onSuccess, onError) {
    const img = new Image();
    img.onload = function () { onSuccess(img.src) };
    img.onerror = onError;
    img.src = src;
};