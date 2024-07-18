const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'F8-PLAYER';


const player = $('.player');
const cd = $('.cd');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play')
const progress = $('#progress');
const prevBtn = $('.btn-prev');
const nextBtn = $('.btn-next');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playList = $('.playlist');
const toggleFormBtn = $('#toggle-form-btn');
const addSongForm = $('#add-song-form');
const addSongBtn = $('#add-song-btn');
const songNameInput = $('#song-name');
const songSingerInput = $('#song-singer');
const songPathInput = $('#song-path');
const songImageInput = $('#song-image');

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Anh đã quen với cô đơn',
            singer: 'Hồng Nguyễn',
            path: './assets/music/AnhDaQuenVoiCoDon.mp3',
            image: './assets/img/catmeme.png'
        },
        {
            name: 'Đừng như thói quen',
            singer: 'Hồng Nguyễn',
            path: './assets/music/DungNhuThoiQuen.mp3',
            image: './assets/img/catmeme.png'
        },
        {
            name: 'Nếu anh đi',
            singer: 'Hồng Nguyễn',
            path: './assets/music/NeuAnhDi.mp3',
            image: './assets/img/catmeme.png'
        },
        {
            name: 'Người ấy',
            singer: 'Hồng Nguyễn',
            path: './assets/music/NguoiAy.mp3',
            image: './assets/img/catmeme.png'
        },
        {
            name: 'Phải chia tay thôi',
            singer: 'Hồng Nguyễn',
            path: './assets/music/PhaiChiaTayThoi.mp3',
            image: './assets/img/catmeme.png'
        },
        {
            name: 'Sai người sai thời điểm',
            singer: 'Hồng Nguyễn',
            path: './assets/music/SaiNguoiSaiThoiDiem.mp3',
            image: './assets/img/catmeme.png'
        },
        {
            name: 'Suýt nữa thì',
            singer: 'Hồng Nguyễn',
            path: './assets/music/SuytNuaThi.mp3',
            image: './assets/img/catmeme.png'
        },
        {
            name: 'Tháng tư là lời nói dối của em',
            singer: 'Hồng Nguyễn',
            path: './assets/music/ThangTuLaLoiNoiDoiCuaEm.mp3',
            image: './assets/img/catmeme.png'
        },
        {
            name: 'Trong trí nhớ của anh',
            singer: 'Hồng Nguyễn',
            path: './assets/music/TrongTriNhoCuaAnh.mp3',
            image: './assets/img/catmeme.png'
        },
        {
            name: 'Xin đừng lặng im',
            singer: 'Hồng Nguyễn',
            path: './assets/music/XinDungLangIm.mp3',
            image: './assets/img/catmeme.png'
        }
    ],
    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
                    <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                        <div class="thumb"
                            style="background-image: url('${song.image}')">
                        </div>
                        <div class="body">
                            <h3 class="title">${song.name}</h3>
                            <p class="author">${song.singer}</p>
                        </div>
                        <div class="option">
                            <i class="fas fa-ellipsis-h"></i>
                        </div>
                    </div>
                    `
        })
        playList.innerHTML = htmls.join('\n');
    },
    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex];
            }
        })
    },
    handleEvents: function () {

        // Xử lý phóng to / thu nhỏ CD
        const cdWidth = cd.offsetWidth;
        const _this = this;

        document.onscroll = function () {
            const scrollTop = document.documentElement.scrollTop || window.scrollY;
            const newCdWidth = cdWidth - scrollTop;
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        }

        // Xử lý CD quay / dừng
        const cdThumbAnimate = cdThumb.animate(
            [
                {
                    transform: 'rotate(360deg)'
                }
            ],
            {
                duration: 10000,
                iterations: Infinity
            }
        )

        cdThumbAnimate.pause();

        // Xử lý khi click play-btn
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause();
            }
            else {
                audio.play();
            };
        }

        // Khi song được play
        audio.onplay = function () {
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        }

        // Khi song bị pause
        audio.onpause = function () {
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }

        // Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = progressPercent;
            }
        }

        // Xử lý khi tua song
        progress.oninput = function (e) {
            const seekTime = e.target.value / 100 * audio.duration;
            audio.currentTime = seekTime;
        }

        // Khi next song
        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        // Khi prev song
        prevBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        // Xử lý bật / tắt random
        randomBtn.onclick = function (e) {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            randomBtn.classList.toggle('active', _this.isRandom);
        }

        // Xử lý lặp lại song
        repeatBtn.onclick = function (e) {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            repeatBtn.classList.toggle('active', _this.isRepeat);
        }

        // Xử lý next song khi audio ended
        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play();
            } else {
                nextBtn.onclick();
            }
        }

        //
        playList.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active')

            if (songNode || e.target.closest('.option')) {
                // Xử lý khi click vào song
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    _this.render();
                    audio.play();
                    console.log(songNode.dataset.index);
                }

                // Xử lý khi click vào song option
                if (e.target.closest('.option')) {

                }
            }
        }

        // Xử lý hiển thị form thêm bài hát
        toggleFormBtn.onclick = function () {
            if (addSongForm.style.display === 'none' || addSongForm.style.display === '') {
                addSongForm.style.display = 'flex';
            } else {
                addSongForm.style.display = 'none';
            }
        }

        // Xử lý thêm bài hát mới
        addSongBtn.onclick = function () {
            const newSong = {
                name: songNameInput.value,
                singer: songSingerInput.value,
                path: songPathInput.value,
                image: songImageInput.value
            };

            _this.songs.push(newSong);
            _this.render();
            addSongForm.style.display = 'none';
            songNameInput.value = '';
            songSingerInput.value = '';
            songPathInput.value = '';
            songImageInput.value = '';
        }

    },
    scrollToActiveSong: function () {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }, 100);
    },
    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path;
    },
    loadConfig: function () {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },
    nextSong: function () {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    prevSong: function () {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },
    playRandomSong: function () {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex);

        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    start: function () {
        // Gán cấu hình từ config vào ứng dụng
        this.loadConfig();

        // định nghĩa các thuộc tính cho object
        this.defineProperties();

        // lắng nghe/ xử lý các sự kiện
        this.handleEvents();

        // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong();

        // Render play list
        this.render();

        // Hiển thị trạng thái ban đầu của btn repeat và random
        randomBtn.classList.toggle('active', this.isRandom);
        repeatBtn.classList.toggle('active', this.isRepeat);

    }
}

app.start();
