// import { Songs } from "./const.js";
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const secondColor = "#d70043";
const mainColor = "#dde1e7";
// !playing view
const songPlayingThumbnail = $(".song-playing-thumbnail .image");
const songPlayingName = $(".song-playing-name");
const songPlayingArtist = $(".song-playing-artist");
// !audio
const audio = $("#audio");
// !playlist
const songList = $(".song-list"); //danh sach bai hat
const closeIcon = $("#close-btn");
const playList = $(".playlist");
const bg = $("#bg");
const dom = {
  //
  timerBox: $("#timer-box"),
  timerBtn: $("#timer-btn"),
  timerOnBtn: $("#timer-on"),
  timerCancelBtn: $("#timer-cancel"),
  timerResetBtn: $("#timer-reset"),
  timeSet: $("#time-set"),
  timeBar: $("#time-bar"),
  timeProgressed: $("#time-progressed"),
  trackSet: $("#track-set"),
  trackBar: $("#track-bar"),
  trackProgressed: $("#track-progressed"),
  timerNotify: $(".timer-header span"),
  //
  searchBox: $("#search-box"),
  clearSearchBox: $("#clear-search"),
  sortingBox: $("#sorting-box"),
  modal: $("#modal"),
  // playlist
  totalSong: $(".total-song span"),
};
// !playing function
const playBtn = $("#play-btn");
const previousBtn = $("#previous-btn");
const nextBtn = $("#next-btn");
const repeatBtn = $("#playback-btn");
const randomBtn = $("#random-btn");
const totalDuration = $("#total-duration");
const currentDuration = $("#current-duration");
const progressed = $("#progressed");
const progressBar = $("#progress_bar");
const popUp = $("#pop-up");
const songLyric = $(".song-playing-lyrics");
const songPlaying = $(".song-playing");
// ! extra button
const lyricBtn = $("#lyric-btn");
const themeBtn = $("#theme-btn");
const playlistBtn = $("#playlist-btn");
// !variables
const randomIndexArray = [0];
const currentIndexArray = [0];
const PLAYER_STORAGE_KEY = "user_key";
var arrayNumber;

function createArrayNumber() {
  const songItems = songList.querySelectorAll("li");
  let array = [];
  for (let i = 1; i <= songItems.length; i++) {
    array.push(i);
  }
  return array;
}
function toMMSS(durationTime) {
  var totalSec = parseInt(durationTime, 10);
  var minutes = Math.floor(totalSec / 60);
  var seconds = totalSec - minutes * 60;

  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  if (seconds < 10) {
    seconds = "0" + seconds;
  }

  var time = minutes + ":" + seconds;
  return time;
}

const app = {
  url: "./songs.json",
  currentIndex: Math.floor(Math.random() * 10),
  previousIndex: 0,
  deg: 0,
  totalSongPlayed: 0,
  trackSetNumber: 0,
  isPlaying: false,
  isRepeat: false,
  isRandom: false,
  isPopUp: false,
  isTimer: false,
  lyrics: [],
  interval: null,
  isSorting: false,
  songData: [],
  dynamicSort(property, isSorting) {
    return function (a, b) {
      if (isSorting) {
        return a[property] > b[property]
          ? -1
          : a[property] < b[property]
          ? 1
          : 0;
      } else {
        return a[property] < b[property]
          ? -1
          : a[property] > b[property]
          ? 1
          : 0;
      }
    };
  },
  async loadSongList(file) {
    return await fetch(file)
      .then((data) => data.json())
      .catch((err) => console.log(err));
  },
  async renderSongList(file) {
    const html = [];
    let totalSong = 0;
    this.songData = await this.loadSongList(file);
    this.songData.map((song, index) => {
      totalSong++;
      html.push(`
        <li class="song-item" data-id=${index}>
        <div class="song-thumbnail" style="background-image: url('${song.img}')">
        <img src="./img/play.svg" alt="" />
        </div>
        <div class="song-info">
        <p class="song-name">${song.name}</p>
        <p class="song-artist">${song.artist}</p>
        </div>
        </li>
        `);
    });
    setTimeout(() => {
      songList.innerHTML = html.join("");
      dom.totalSong.textContent = `(${totalSong})`;
      this.loadCurrentSong();
      this.renderIcon();
      arrayNumber = createArrayNumber();
    }, 1000);
  },
  async loadCurrentSong() {
    const songs = await this.loadSongList(this.url);
    audio.src = songs[this.currentIndex].path;
    setTimeout(() => {
      bg.style.backgroundImage = `url("${songs[this.currentIndex].img}")`;
      songPlayingThumbnail.style.backgroundImage = `url(${
        songs[this.currentIndex].img
      })`;
      songPlayingName.innerText = songs[this.currentIndex].name;
      songPlayingArtist.innerText = songs[this.currentIndex].artist;
      totalDuration.innerText = toMMSS(audio.duration);
      this.showLyric(songs[this.currentIndex].lyric);
      this.activeCurrentSong();
    }, 1000);
  },
  setStyle([...element], object) {
    for (let i = 0; i < [...element].length; i++) {
      var e = $([...element][i]);
      for (const property in object) {
        e.style[property] = object[property];
      }
    }
  },
  renderIcon() {
    setTimeout(() => {
      this.setStyle(
        [
          ".song-playing-header",
          ".song-playing-thumbnail",
          ".song-playing-info",
          ".song-playing-duration",
          ".song-playing-button",
        ],
        {
          visibility: "visible",
          opacity: "1",
        }
      );
      lyricBtn.querySelector("img").src = "./img/playlist-16.svg";
      playBtn.querySelector("img").src = "./img/play.svg";
      playBtn.style.backgroundColor = secondColor;
    }, 300);
    setTimeout(() => {
      dom.timerBtn.querySelector("img").src = "./img/alarm-14.svg";
      nextBtn.querySelector("img").src = "./img/next.svg";
      previousBtn.querySelector("img").src = "./img/previous.svg";
    }, 400);
    setTimeout(() => {
      themeBtn.querySelector("img").src = "./img/theme-28.svg";
      repeatBtn.querySelector("img").src = "./img/repeat.svg";
      randomBtn.querySelector("img").src = "./img/random.svg";
    }, 500);
    setTimeout(() => {
      playlistBtn.querySelector("img").src = "./img/library.svg";
    }, 600);
  },
  changeSong(e) {
    const songItems = songList.querySelectorAll("li");
    this.previousIndex = this.currentIndex;
    if (this.isRandom) {
      this.getRandomIndex();
    }
    if (e.id === "next-btn") {
      if (this.currentIndex >= songItems.length) {
        this.currentIndex = 0;
      } else {
        this.currentIndex++;
      }
    }
    if (e.id === "previous-btn") {
      if (this.currentIndex <= 0) {
        this.currentIndex = songItems.length - 1;
      } else {
        this.currentIndex--;
      }
    }
    this.loadCurrentSong();
    this.playSong();
  },
  getRandomIndex() {
    if (!arrayNumber.length) {
      arrayNumber = createArrayNumber();
    }
    if (arrayNumber.length) {
      let index = Math.floor(Math.random() * arrayNumber.length);
      this.currentIndex = arrayNumber[index] - 1;
      arrayNumber[index] = "";
      arrayNumber = arrayNumber.filter((a) => {
        return a;
      });
    }
  },
  activeCurrentSong() {
    const songItems = songList.querySelectorAll("li");
    songItems[this.currentIndex].classList.add("active");
    if (this.previousIndex !== this.currentIndex) {
      songItems[this.previousIndex].classList.remove("active");
    }
  },
  showPopUp(e, text) {
    if (e === dom.timeSet || e === dom.trackSet) {
      popUp.innerText = text;
    }
    if (e === repeatBtn || e === randomBtn) {
      if (this.isRepeat || this.isRandom) {
        popUp.innerText = text + ": Bật";
      } else [(popUp.innerText = text + ": Tắt")];
    }

    popUp.classList.add("active");
    this.isPopUp = true;
    setTimeout(() => {
      popUp.classList.remove("active");
      this.isPopUp = false;
    }, 1500);
  },
  parseLyric(lrc) {
    const regex = /^\[(?<time>\d{2}:\d{2}(.\d{2})?)\](?<text>.*)/;
    const lines = lrc.split("\n");
    const output = [];

    lines.forEach((line) => {
      const match = line.match(regex);
      // if doesn't match, return.
      if (match == null) return;

      const { time, text } = match.groups;
      // get time and text after match
      output.push({
        time: parseTime(time),
        text: text.trim(),
      });
    });

    // parse formated time
    // "03:24.73" => 204.73 (total time in seconds)
    function parseTime(time) {
      const minsec = time.split(":");
      const min = parseInt(minsec[0]) * 60;
      const sec = parseFloat(minsec[1]);
      return min + sec;
      //   total time in sec
    }

    return output;
  },
  showLyric: async function (url) {
    const res = await fetch(url);
    const lrc = await res.text();
    this.lyrics = this.parseLyric(lrc);
  },
  syncLyric(lyrics, time) {
    const scores = [];

    lyrics.forEach((lyric) => {
      // get the gap or distance or we call it score
      const score = time - lyric.time;

      // only accept score with positive values
      if (score >= 0) scores.push(score);
    });

    if (scores.length == 0) return null;

    // get the smallest value from scores
    const closest = Math.min(...scores);
    // return the index of closest lyric
    return scores.indexOf(closest);
  },
  playSong() {
    this.isPlaying = true;
    playBtn.classList.toggle("playing", this.isPlaying);
    setTimeout(() => {
      audio.play();
    }, 1000);
  },
  timerBarClick(e, d) {
    let wPercent =
      (e.offsetX / d.querySelector(".timer-bar").offsetWidth) * 100;
    let n = d === dom.timeSet ? 120 : 40;
    d.querySelector(".timer-bar .timer-progressed").style.width =
      wPercent + "%";
    d.querySelector("p span").innerText = Math.round((wPercent * n) / 100);
    d.dataset.timer = Math.round((wPercent * n) / 100);

    e = d === dom.timeSet ? dom.trackSet : dom.timeSet;
    e.querySelector(".timer-bar .timer-progressed").style.width = 0;
    e.querySelector("p span").innerText = 0;
    e.dataset.timer = 0;
  },
  handleEvents() {
    const that = this;
    dom.searchBox.oninput = (e) => {
      const searchValue = dom.searchBox.value.toLowerCase();
      const songItems = songList.querySelectorAll("li");
      if (e.data == null || true) {
        songItems.forEach((li) => {
          if (!li.textContent.toLowerCase().includes(searchValue)) {
            li.style.display = "none";
            dom.totalSong.textContent = `${songItems.length}`;
          } else {
            li.style.display = "";
          }
        });
      }
      if (searchValue !== "") {
        dom.clearSearchBox.classList.add("active");
      } else {
        dom.clearSearchBox.classList.remove("active");
      }
    };
    dom.clearSearchBox.onclick = () => {
      const songItems = songList.querySelectorAll("li");
      dom.searchBox.value = "";
      dom.clearSearchBox.classList.remove("active");
      songItems.forEach((li) => {
        li.style.display = "";
      });
    };

    ///play/pause song
    playBtn.onclick = (e) => {
      return !this.isPlaying ? that.playSong() : audio.pause();
    };
    /// next song
    nextBtn.onclick = (e) => {
      this.changeSong(nextBtn);
    };
    // /previous song
    previousBtn.onclick = (e) => {
      this.changeSong(previousBtn);
    };
    audio.ontimeupdate = (e) => {
      const progressPercent = (audio.currentTime / audio.duration) * 100;
      progressed.style.width = progressPercent + "%";
      let songCurrentTime = toMMSS(audio.currentTime);
      currentDuration.innerText = songCurrentTime;
      this.deg = audio.currentTime * 10;
      songPlayingThumbnail.style.transform = `rotate(${this.deg}deg)`;
      //
      const time = audio.currentTime;
      const index = this.syncLyric(this.lyrics, time);
      if (index == null) return;
      songLyric.innerHTML = `<li>${this.lyrics[index].text}</li>`;
    };
    songList.onclick = function (e) {
      const songTarget = e.target.closest(".song-item:not(.active)");
      that.previousIndex = that.currentIndex;
      if (songTarget) {
        that.currentIndex = Number(songTarget.dataset.id);
        that.loadCurrentSong();
        that.playSong();
      }
    };
    ///audio end
    audio.onended = () => {
      if (that.trackSetNumber > 0) {
        that.trackSetNumber--;
        dom.timerNotify.innerText = `còn ${that.trackSetNumber} bài `;
      }
      if (that.trackSetNumber === 0 && that.isTimer) {
        audio.pause();
        that.isTimer = false;
        dom.timerNotify.innerText = "Tắt";
        dom.timerOnBtn.innerText = "Bật";
        return;
      }

      this.isPlaying = false;
      playBtn.classList.toggle("playing", this.isPlaying);
      this.isRepeat ? that.playSong() : nextBtn.click();
    };
    /// audio start
    audio.onplay = () => {};
    ///audio pause
    audio.onpause = () => {
      this.isPlaying = false;
      playBtn.classList.toggle("playing", this.isPlaying);
    };
    ///fast forward
    progressBar.onclick = (e) => {
      audio.currentTime =
        (audio.duration / 100) * ((e.offsetX * 100) / progressBar.offsetWidth);
      that.playSong();
    };
    ///repeat
    repeatBtn.onclick = () => {
      if (!this.isPopUp) {
        this.isRepeat = !this.isRepeat;
        repeatBtn.classList.toggle("active", this.isRepeat);
        this.showPopUp(repeatBtn, "Lặp lại");
      }
      //
    };
    ///random
    randomBtn.onclick = () => {
      if (!this.isPopUp) {
        this.isRandom = !this.isRandom;
        randomBtn.classList.toggle("active", this.isRandom);
        this.showPopUp(randomBtn, "Ngẫu nhiên");
      }
      //
    };
    bg.onclick = (e) => {
      if (
        bg.classList.contains("hide") &&
        e.target.closest("#play-btn") != playBtn
      ) {
        bg.classList.remove("hide");
      }
    };
    playlistBtn.onclick = (e) => {
      songLyric.classList.remove("active");
      setTimeout(() => {
        bg.classList.add("hide");
      });
    };
    lyricBtn.onclick = (e) => {
      songLyric.classList.toggle("active");
    };

    // !TIMER
    /// show / hide timer box
    dom.timerBtn.onclick = () => {
      dom.timerBox.classList.add("active");
      dom.modal.classList.add("active");
    };
    /// timer on button
    dom.timerOnBtn.onclick = (e) => {
      let timeDataSet = dom.timeSet.dataset.timer;
      let trackDataSet = dom.trackSet.dataset.timer;
      function timeSet() {
        that.isTimer = true;
        let timeLeft = timeDataSet * 60; // tổng số giây còn lại

        handleTimer(dom.timeSet, `Dừng nhạc sau: ${timeDataSet} phút`);
        that.interval = setInterval(changeTimer, 1000);
        function changeTimer() {
          if (timeLeft == 0) {
            audio.pause();
            clearTimer();
            clearInterval(that.interval);
            that.interval = null;
            return;
          }
          timeLeft--; //giảm 1 mỗi 1s
          dom.timerNotify.innerText = `còn ${toMMSS(timeLeft)}`; // hiển thị số giây còn lại ra bảng
        }
      }
      function trackSet() {
        that.isTimer = true;
        that.trackSetNumber = parseInt(trackDataSet); // chuyển string sang number
        handleTimer(dom.trackSet, `Dừng nhạc sau: ${that.trackSetNumber} bài`);
        dom.timerNotify.innerText = `còn ${that.trackSetNumber} bài`;
      }
      function handleTimer(d, text) {
        dom.timerOnBtn.innerText = "Tắt"; // đổi bật sang tắt
        dom.modal.click(); // ẩn bảng hẹn giờ
        that.showPopUp(d, text); //hiện thông báo
      }
      //
      function clearTimer() {
        dom.timerNotify.innerText = "Tắt";
        dom.timerOnBtn.innerText = "Bật";
        that.isTimer = false;
      }
      function clearTimeSet() {
        if (that.interval != null) {
          clearTimer();
          clearInterval(that.interval);
          that.interval = null;
          return;
        }
      }
      function clearTrackSet() {
        clearTimer();
        that.trackSetNumber = 0;
      }
      if (that.isTimer) {
        clearTimeSet();
        clearTrackSet();
        return;
      }
      //@ time set - bật
      timeDataSet > 0 && !that.isTimer && timeSet();
      //@ track set - bật
      trackDataSet > 0 && !that.isTimer && trackSet();
    };
    ///timer cancel button
    dom.timerCancelBtn.onclick = (e) => {
      //
      dom.modal.click();
    };

    dom.timeBar.onclick = (e) => {
      this.timerBarClick(e, dom.timeSet);

      //
    };
    dom.trackBar.onclick = (e) => {
      this.timerBarClick(e, dom.trackSet);
      //
    };
    // !
    dom.modal.onclick = (e) => {
      dom.timerBox.classList.remove("active");
      dom.modal.classList.remove("active");
    };
    //
    //
  },
  //
  //
  //
  start() {
    this.renderSongList(this.url);
    this.handleEvents();
  },
};
app.start();
