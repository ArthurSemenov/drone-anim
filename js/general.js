document.addEventListener('DOMContentLoaded', function() {

    // News slider
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    if (viewportWidth < 768) {
        const newsSlider = new Swiper('.js-news-slider', {
            direction: 'horizontal',
            loop: true,
            slidesPerView: 1,
            pagination: {
                el: '.js-news-slider-pagination',
                type: 'bullets',
            },
        });
    }

    // Gallery slider
    const gallerySlider = new Swiper('.js-gallery-slider', {
        direction: 'horizontal',
        loop: false,
        slidesPerView: 'auto',
        freeMode: {
            enabled: true,
            momentumVelocityRatio: 0.75,
            momentumRatio: 0.75,
            momentumBounceRatio: 0.75
        },
    });

    // Sorting
    (function () {
        const filterForm = document.getElementById('listing-wrapper');

        if(!!filterForm) {
            filterForm.addEventListener("click", function (e) {
                const sortList = filterForm.querySelector('.js-sort');

                if(e.target.className === "sort__selected") {
                    sortList.classList.toggle('is-drop-opened');
                }

                if(!e.target.closest('.js-sort') || e.target.closest('.js-sort') === null) {
                    sortList.classList.remove('is-drop-opened');
                }
            })
        }
    }());

    // Tab Slider
    (function () {
        const mqTablet = window.matchMedia('(min-width: 768px)');
        const slidesPerViewDesktop = 3;
        let sliderTabs, galleryMain;

        const calcHeight = function (elem, array) {
            let totalHeight = 0;

            array.filter((a, index)=> index < slidesPerViewDesktop).forEach(function (item) {
                totalHeight += item.offsetHeight;
            });

            elem.style.height = `${totalHeight}px`;
        };

        function initSwiper() {
            sliderTabs = new Swiper(".js-thumbs-slider", {
                direction: 'horizontal',
                slidesPerView: 1.5,
                watchSlidesVisibility: true,
                watchSlidesProgress: true,
                slideToClickedSlide: true,
                breakpoints: {
                    600: {
                        slidesPerView: 2.2,
                    },
                    768: {
                        direction: 'vertical',
                        slidesPerView: "auto",
                    }
                },
            });

            galleryMain = new Swiper(".js-tabs-content", {
                watchOverflow: true,
                preventInteractionOnTransition: true,
                effect: 'fade',
                thumbs: {
                    swiper: sliderTabs,
                    autoScrollOffset: 0.05
                },
                fadeEffect: {
                    crossFade: true
                },
                on: {
                    init: function () {
                        let $this = this;
                        const viewedSliders = Array.from($this.thumbs.swiper.visibleSlides);

                        if (viewedSliders.length > 2 && mqTablet.matches) {
                            calcHeight($this.thumbs.swiper.el, viewedSliders);
                        }
                    },
                    slideChange: function () {
                        let $this = this;
                        const viewedSliders = Array.from($this.thumbs.swiper.visibleSlides);

                        if (viewedSliders.length > 2 && mqTablet.matches) {
                            calcHeight($this.thumbs.swiper.el, viewedSliders);
                        }
                    }
                }
            });
        }

        if(document.querySelector('.js-thumbs-slider')) {
            initSwiper();

            mqTablet.onchange = (e) => {
                if (e.matches && sliderTabs !== undefined) {
                    sliderTabs.destroy( true, true );
                    galleryMain.destroy( true, true );
                    initSwiper();
                } else {
                    if ( sliderTabs !== undefined && galleryMain !== undefined) {
                        sliderTabs.destroy( true, true );
                        galleryMain.destroy( true, true );
                        initSwiper();
                    }
                }
            };
        }
    }());

    // AOS Anim init
    AOS.init({
        delay: 50,
        duration: 750,
        easing: 'ease-out',
        once: true,
    });

    jQuery(document).on('change', '.input-text.qty.text', function(){
        $(document).find('.woocommerce-cart-form button[name="update_cart"]').trigger('click');
    });
});

$(function(){
    // Open-close init
    $('.js-faq-open-close').openClose({
        activeClass: 'is-active',
        opener: '.js-faq-opener',
        slider: '.js-faq-slide',
        animSpeed: 400,
        effect: 'slide'
    });

    // Sticky Nav
    $(".js-faq-nav")
        .click(function(){
            $(this).toggleClass("is-open");
        })

        .stickyNavbar({
            selector: "li",
            activeClass: "is-active",
            stickyModeClass: "is-sticky",
            mobileWidth: 0
        });

    window.addEventListener('message', event => {
        if(event.data.type === 'hsFormCallback' && event.data.eventName === 'onFormReady') {
            $('form').attr('autocomplete', 'off');
        }
    });
});

// Бегущая строка
$(window).on('load', function () {
    let pressContainer = $('.js-marquee');
    if (pressContainer.length > 0) {
        let pressWidthItem = 0;

        $('.filter-press__item').each(function () {
            pressWidthItem += $(this).width();
        });

        if(pressWidthItem > pressContainer.width()) {
            const marqueePress =  pressContainer.marquee({
                startVisible: true,
                speed: 80,
                gap: 0,
                delayBeforeStart: 0,
                direction: 'left',
                duplicated: true,
                duplicateIteration: 2,
                //pauseOnParentHover: true
            });
        }
    }
});
