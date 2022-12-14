document.addEventListener("DOMContentLoaded", function () {
    const loader = new PxLoader();
    const loaderScreen = document.getElementById("product-loader");
    const loaderCounter = document.getElementById("product-loader-counter");
    const loaderCounterItems = document.getElementById(
        "product-loader-counter-items"
    );
    const locoScrollContainer = document.querySelector(
        "[data-product-scroll-container]"
    );
    const locoScroll = new LocomotiveScroll({
        el: locoScrollContainer,
        smooth: true,
        repeat: true,
        smartphone: {
            smooth: true,
        },
        tablet: {
            smooth: true,
        },
        getDirection: true,
    });
    const fullPage = document.getElementById("fullpage");
    const templateUrl = '';
    const imgFormat = ".webp";
    const imgFolder = "product/anim";
    const contentScreens = document.querySelectorAll(".js-content-screen");
    const canvasWrap = document.getElementById("product-canvas");
    const canvases = [
        {
            canvas: document.getElementById("canvas-intro-screen"),
            context: document
                .getElementById("canvas-intro-screen")
                .getContext("2d", { alpha: true }),
            templatePath: `images/${imgFolder}/1_Drone_Fade_in_and_Rotate/1_Drone_fade_in_and_rotate`,
            currentFrame: function (index) {
                return `${(this.templatePath + index)
                    .toString()
                    .padStart(1, "0")}.imgFormat`;
            },
            framesArray: [],
            totalFramesCount: 70,
            frames: { frame: 0 },
            duration: 2.333,
            ease: "linear",
            delay: 200,
            once: true,
            scrollable: true,
            contentAttr: "intro-screen",
        },
        {
            canvas: document.getElementById("canvas-away-screen"),
            context: document
                .getElementById("canvas-away-screen")
                .getContext("2d", { alpha: true }),
            templatePath: `images/${imgFolder}/2_Drone_fade_out/2_Drone_fade_out`,
            currentFrame: function (index) {
                return `${(this.templatePath + index)
                    .toString()
                    .padStart(1, "0")}.imgFormat`;
            },
            framesArray: [],
            totalFramesCount: 81,
            frames: { frame: 0 },
            duration: 1.8,
            ease: "linear",
            delay: 200,
            scrollable: true,
            contentAttr: "away-screen",
        },
    ];

    let listening = false;
    let sequencesEnded = false;
    let len = canvases.filter(({ scrollable }) => scrollable === true).length;
    let i = 0;
    let canvasTweens = [];

    const anim = {
        init: function () {
            this.drawCanvasSize();
            // this.pushCanvasFrames();
            this.canvasGsap();
            this.canvasRenderInit();
        },
        drawCanvasSize: function () {
            canvases.forEach((item) => {
                item.canvas.width = window.innerWidth;
                item.canvas.height = (1080 / 1920) * window.innerWidth;
            });
        },
        pushCanvasFrames: function () {
            canvases.forEach((item) => {
                for (let i = 0; i < item.totalFramesCount; i++) {
                    const frameImg = new Image();
                    frameImg.src = item.currentFrame(i);
                    item.framesArray.push(frameImg);
                }
            });
        },
        canvasGsap: function () {
            canvases.forEach((item) => {
                let canvasItem = gsap.to(item.frames, item.duration, {
                    frame: item.totalFramesCount - 1,
                    snap: "frame",
                    ease: item.ease,
                    paused: true,
                    onUpdate: function () {
                        if (item.scrollable) {
                            listening = false;
                            anim._canvasContentAnim(
                                item.contentAttr,
                                canvasItem.reversed()
                            );
                        }

                        anim._canvasRender(item);
                    },
                    onComplete: function () {
                        if (item.scrollable) {
                            setTimeout(function () {
                                listening = true;
                            }, item.delay);
                        }

                        if (item.contentAttr === "away-screen") {
                            sequencesEnded = true;
                            finish();
                        }
                    },
                    onReverseComplete: function () {
                        if (item.scrollable) {
                            setTimeout(function () {
                                listening = true;
                            }, item.delay);
                        }
                    },
                });
                canvasTweens.push(canvasItem);
            });
        },
        _canvasImgScaleToFit: function (item, img) {
            const scale = Math.min(
                item.canvas.width / img.width,
                item.canvas.height / img.height
            );
            const x = item.canvas.width / 2 - (img.width / 2) * scale;
            const y = item.canvas.height / 2 - (img.height / 2) * scale;
            item.context.drawImage(
                img,
                x,
                y,
                img.width * scale,
                img.height * scale
            );
        },
        _canvasRender: function (item) {
            item.context.clearRect(0, 0, item.canvas.width, item.canvas.height);
            this._canvasImgScaleToFit(
                item,
                item.framesArray[item.frames.frame]
            );
        },
        _canvasContentAnim: function (attr, reversed) {
            let value = attr;
            let reversedState = reversed;

            [...contentScreens].forEach((el, index) => {
                let dataAttr = el.dataset.content;
                if (dataAttr === value) {
                    if (!reversedState) {
                        el.classList.add("active-screen");
                    } else {
                        el.classList.remove("active-screen");
                        el.classList.remove("active-screen-back");

                        if (index === 5) {
                            contentScreens[index - 2].classList.add(
                                "active-screen-back"
                            );
                        } else if (index === 3) {
                            contentScreens[4].classList.add(
                                "active-screen-back"
                            );
                        } else if (index === 4) {
                            contentScreens[2].classList.add("active-screen");
                        } else if (index <= 0) {
                            contentScreens[0].classList.add("active-screen");
                        } else {
                            contentScreens[index - 1].classList.add(
                                "active-screen"
                            );
                        }
                    }
                } else {
                    el.classList.remove("active-screen");
                }
            });
        },
        canvasRenderInit: function () {
            canvases.forEach((item) => {
                item.framesArray[0].onload = function () {
                    item.context.clearRect(
                        0,
                        0,
                        item.canvas.width,
                        item.canvas.height
                    );
                    anim._canvasImgScaleToFit(
                        item,
                        item.framesArray[item.frames.frame]
                    );
                };
            });
        },
        handleLoader: function () {
            // Loader
            let addImagesForTag = function (tag, items) {
                items.forEach((item) => {
                    for (let i = 0; i < item.totalFramesCount; i++) {
                        let pxImage = new PxLoaderImage(
                            item.templatePath + i + imgFormat
                        );
                        pxImage.imageNumber = i + 1;
                        loader.add(pxImage);
                        item.framesArray.push(pxImage.img);
                    }
                });

                if (tag === "first") {
                    loader.addProgressListener(function (e) {
                        let progress = Math.round(
                            (100 / e.totalCount) * e.completedCount
                        );

                        if (progress > 97) {
                            loaderCounter.classList.add("loaded");
                            loaderCounterItems.style.transform =
                                "translate3d(0, -98.1%, 0)";
                            loaderScreen.classList.add("loaded");
                        } else {
                            loaderCounterItems.style.transform = `translate3d(0, -${progress}%, 0)`;
                        }
                    });
                }
            };

            addImagesForTag("first", canvases.slice(0, 2));

            let something = (function () {
                var executed = false;
                return function () {
                    if (!executed) {
                        executed = true;
                        document.body.classList.add("anim-loaded");
                        loaderScreen.classList.add("loaded");

                        setTimeout(function () {
                            anim.drawCanvasSize();
                            anim.canvasGsap();
                            locoScroll.stop();
                            canvasTweens[0].play();
                        }, 1100);

                        setTimeout(function () {
                            addImagesForTag(
                                "second",
                                canvases.slice(2, canvases.length)
                            );
                            loader.start(["second"]);
                        }, 10000);
                    }
                };
            })();

            loader.addCompletionListener(function () {
                something();
            });

            loader.start(["first"]);
        },
    };
    anim.handleLoader();

    function is_touch_enabled() {
        return (
            "ontouchstart" in window ||
            navigator.maxTouchPoints > 0 ||
            navigator.msMaxTouchPoints > 0
        );
    }

    if (is_touch_enabled()) {
        document.body.classList.add("touch-device");
    }

    window.addEventListener("load", function () {
        locoScroll.update();
    });

    const fullPageScroll = new fullpage("#fullpage", {
        licenseKey: "MK9V7-QU5LH-IFJ1J-6I2L9-DMLQM",
        keyboardScrolling: false,
        beforeLeave: function () {
            if (listening === false) {
                return false;
            }
        },
        onLeave: function (origin, destination, direction, trigger) {
            if (direction === "down") {
                slideIn();
            }
            if (direction === "up") {
                slideOut();
            }
        },
    });

    function slideIn() {
        if (!(i > len)) {
            i = i + 1;
        }

        if (!(i > len - 1)) {
            canvases.forEach((item) => {
                item.canvas.classList.remove("active");
            });
            contentScreens.forEach((item) => {
                item.classList.remove("active-screen-back");
            });
            canvases[i].canvas.classList.add("active");
            canvasTweens[i].play(0);

            setTimeout(function () {},
            canvases[i].duration + canvases[i].delay);
        } else {
            return false;
        }
    }

    function slideOut() {
        if (i === len) {
            i = len - 1;
        }
        if (i < 0) {
            i = 0;
        }

        canvasTweens[i].reverse();

        setTimeout(function () {
            if (!(i < 0)) {
                i = i - 1;
            }
        }, canvases[i].duration + canvases[i].delay);

        canvases.forEach((item) => {
            item.canvas.classList.remove("active");
        });
        contentScreens.forEach((item) => {
            item.classList.remove("active-screen-back");
        });
        canvases[i].canvas.classList.add("active");
    }

    function finish() {
        const firstScreen = document.querySelector(
            '[data-scroll-section-id="section0"]'
        );

        fullpage_api.setAllowScrolling(false);

        [...contentScreens].forEach((el) => {
            el.classList.remove("active-screen");
        });

        fullPage.classList.add("hidden");
        canvasWrap.classList.add("hidden");
        locoScrollContainer.classList.add("active");
        firstScreen.classList.add("active-first-screen");
        locoScroll.start();

        setTimeout(function () {
            firstScreen.classList.remove("active-first-screen");
        }, 1800);
    }

    locoScroll.on("scroll", function (args) {
        let position = args.delta.y;
        if (position === 0) {
            fullpage_api.setAllowScrolling(true);
            fullPage.classList.remove("hidden");
            canvasWrap.classList.remove("hidden");
            locoScrollContainer.classList.remove("active");
            locoScroll.stop();

            if (sequencesEnded) {
                contentScreens[contentScreens.length - 1].classList.add(
                    "active-screen-back"
                );
            }
        }
    });
});

/* document.addEventListener("DOMContentLoaded", function () {
    gsap.registerPlugin(ScrollTrigger);

    gsap.to(".js-phone-ttl", {
        scrollTrigger: {
            trigger: ".js-phone-screen",
            markers: true,
            start: "top top",
            end: "+=400",
            pin: ".js-phone-screen",
            scrub: 2,
        },
        opacity: 0,
        y: 100,
    });
});
 */