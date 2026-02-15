
var swiper = new Swiper(".testiSwiper1", {
    slidesPerView: 1,
    loop: false,
    spaceBetween: 40,
    centeredSlides: true,
    allowTouchMove: false,
    navigation: {
        prevEl: ".swiper-btn-prev",
        nextEl: ".swiper-btn-next",
    },
    on: {
        slideChange: function () {
            const prev = document.querySelector('.swiper-button .swiper-btn-prev');
            const next = document.querySelector('.swiper-button .swiper-btn-next');

            const total = this.slides.length - (this.loopedSlides ? this.loopedSlides * 2 : 0);

            const perView = this.params.slidesPerView === 'auto' ? 1 : this.params.slidesPerView;

            const lastIndex = Math.max(0, total - perView);

            const current = this.realIndex;

            if (current === 0) {
                prev.classList.add("disabled");
                next.classList.remove("disabled");
            }
            else if (current >= lastIndex) {
                next.classList.add("disabled");
                prev.classList.remove("disabled");
            }
            else {
                prev.classList.remove("disabled");
                next.classList.remove("disabled");
            }
        }
    }
});

// features nav-tabs js
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.features-content').forEach(content => { content.style.display = 'none'; });
    const activeTab = document.querySelector('.tab.active');
    if (activeTab) {
        const target = activeTab.dataset.target;
        document.getElementById(target).style.display = 'block';
    }

    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function (e) {
            e.preventDefault();

            const target = this.dataset.target;

            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));

            document.querySelectorAll('.features-content').forEach(content => { content.style.display = 'none'; });

            this.classList.add('active');

            document.getElementById(target).style.display = 'block';
        });
    });
})
