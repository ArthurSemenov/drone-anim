$(document).ready(function(){
    if($(window).innerWidth() > 1024) {
        // Custom cursor
        let clientX = -100;
        let clientY = -100;
        const cursor = $('.js-custom-cursor');
        const cursorInner = $('.js-custom-cursor-inner');
        const timelinePrevCursor = $('.js-timeline-prev-cursor');
        const timelineNextCursor = $('.js-timeline-next-cursor');
        const gallerySlider = $('.js-test-slider');
        const initCursor = () => {
            $(document).on('mousemove', e => {
                clientX = e.clientX;
                clientY = e.clientY;
            });

            const render = () => {
                cursorInner.css('transform', `translate3d(${clientX}px, ${clientY}px, 0)`);
                requestAnimationFrame(render);
            };
            requestAnimationFrame(render);
        };

        initCursor();

        timelinePrevCursor.on({
            mouseenter: function() { cursor.addClass('timeline-prev'); },
            mousedown: function() { cursor.addClass('timeline-prev'); },
            mouseleave:function(){ cursor.removeClass('timeline-prev'); }
        });
        timelineNextCursor.on({
            mouseenter: function() { cursor.addClass('timeline-next'); },
            mousedown: function() { cursor.addClass('timeline-next'); },
            mouseleave:function(){ cursor.removeClass('timeline-next'); }
        });
        gallerySlider.on({
            mouseenter: function() { cursor.addClass('gallery-swipe'); },
            mousedown: function() { cursor.addClass('gallery-swipe'); },
            mouseleave:function(){ cursor.removeClass('gallery-swipe'); }
        });
    }
});
