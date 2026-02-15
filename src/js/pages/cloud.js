document.addEventListener('DOMContentLoaded', () => {

    const stepImages = {
        1: '../images/cloudstorage/webhosting.jpg',
        2: '../images/cloudstorage/deployment.jpg',
        3: '../images/blog/blogimgs/img4.jpg',
        4: '../images/blog/blogimgs/img8.jpg'
    };

    document.querySelectorAll('.step-content').forEach(content => {
        content.style.display = 'none';
    });

    const activeStep = document.querySelector('.process-num-outer-border.active');
    if (activeStep) {
        const target = activeStep.dataset.target;
        const stepNum = parseInt(activeStep.querySelector('.process-num').textContent);
        document.getElementById(target).style.display = 'block';

        const stepImage = document.getElementById('stepImage');
        if (stepImage && stepImages[stepNum]) {
            stepImage.src = stepImages[stepNum];
        }
    }

    document.querySelectorAll('.process-num-outer-border').forEach(step => {
        step.addEventListener('click', function (e) {
            e.preventDefault();

            const clickedStep = parseInt(this.querySelector('.process-num').textContent);
            const totalSteps = 4;
            const target = this.dataset.target;

            document.querySelectorAll('.process-num-outer-border').forEach(s => {
                const stepNum = parseInt(s.querySelector('.process-num').textContent);

                s.classList.remove('active', 'completed');

                if (stepNum < clickedStep) {
                    s.classList.add('completed');
                } else if (stepNum === clickedStep) {
                    s.classList.add('active');
                }
            });

            const progressWidth = ((clickedStep - 1) / (totalSteps - 1)) * 90;
            document.querySelector('.connecting-line-active').style.width = progressWidth + '%';

            document.querySelectorAll('.step-content').forEach(content => {
                content.style.display = 'none';
            });

            document.getElementById(target).style.display = 'block';

            const stepImage = document.getElementById('stepImage');
            if (stepImage && stepImages[clickedStep]) {
                stepImage.classList.add('fade-out');
                
                setTimeout(() => {
                    stepImage.src = stepImages[clickedStep];
                    stepImage.classList.remove('fade-out');
                    stepImage.classList.add('fade-in');
                    
                    setTimeout(() => {
                        stepImage.classList.remove('fade-in');
                    }, 200);
                }, 200);
            }
        });
    });
});