class Calculator {
      constructor() {
        this.display = document.getElementById('display');
        this.keys = document.getElementById('keys');
        this.calculator = document.getElementById('calculator');
        this.audio = document.getElementById('bgAudio');
        
        this.expression = '';
        this.isLyricMode = false;
        this.currentLyricIndex = 0;
        this.typingInterval = null;
        this.deletingInterval = null;
        
        this.lyrics = [
          { text: ":(", typeSpeed: 300, holdTime: 1800, deleteSpeed: 30 },
          { text: "Kung ano man ang totoo", typeSpeed: 200, holdTime: 1800, deleteSpeed: 30 },
          { text: "isip man ay litong lito", typeSpeed: 170, holdTime: 1900, deleteSpeed: 30 },
          { text: "Handang handa akong", typeSpeed: 100, holdTime: 1000, deleteSpeed: 30 },
          { text: "sumalo", typeSpeed: 150, holdTime: 1800, deleteSpeed: 50 },
          { text: "pagkat Ikaw parin", typeSpeed: 120, holdTime: 800, deleteSpeed: 20 },
          { text: "sigaw ng puso", typeSpeed: 150, holdTime: 1200, deleteSpeed: 30 },
        ];
        
        this.init();
      }
      
      init() {
        this.keys.addEventListener('click', this.handleClick.bind(this));
        document.addEventListener('keydown', this.handleKeyboard.bind(this));
        this.updateDisplay();
        
        // Set audio volume and loop
        this.audio.volume = 0.7;
        this.audio.loop = true;
      }
      
      handleClick(e) {
        const button = e.target.closest('button');
        if (!button) return;
        
        const key = button.dataset.key;
        this.processKey(key);
      }
      
      handleKeyboard(e) {
        const keyMap = {
          'Enter': '=',
          'Escape': 'clear',
          'Backspace': 'backspace'
        };
        
        const key = keyMap[e.key] || e.key;
        if (this.isValidKey(key)) {
          e.preventDefault();
          this.processKey(key);
        }
      }
      
      isValidKey(key) {
        return /[0-9+\-*/.()=]/.test(key) || ['clear', 'backspace'].includes(key);
      }
      
      processKey(key) {
        if (this.isLyricMode) {
          this.stopLyricMode();
          return;
        }
        
        switch (key) {
          case '=':
            this.startLyricMode();
            break;
          case 'clear':
            this.clear();
            break;
          case 'backspace':
            this.backspace();
            break;
          default:
            this.appendToExpression(key);
        }
      }
      
      appendToExpression(key) {
        const operatorMap = {
          '×': '*',
          '÷': '/',
          '−': '-'
        };
        
        const actualKey = operatorMap[key] || key;
        this.expression += actualKey;
        this.updateDisplay();
      }
      
      clear() {
        this.expression = '';
        this.updateDisplay();
      }
      
      backspace() {
        this.expression = this.expression.slice(0, -1);
        this.updateDisplay();
      }
      
      updateDisplay() {
        if (!this.isLyricMode) {
          const displayExpression = this.expression
            .replace(/\*/g, '×')
            .replace(/\//g, '÷')
            .replace(/-/g, '−');
          
          this.display.textContent = displayExpression || '0';
        }
      }
      
      async startLyricMode() {
        this.isLyricMode = true;
        this.calculator.classList.add('lyric-mode');
        this.currentLyricIndex = 0;
        this.expression = '';
        
        // Play the audio
        try {
          await this.audio.play();
          console.log('Audio started playing');
        } catch (error) {
          console.log('Audio play failed:', error);
          // Note: Modern browsers require user interaction to play audio
          // If it fails, you might need to show a play button or handle it differently
        }
        
        this.playNextLyric();
      }
      
      stopLyricMode() {
        this.isLyricMode = false;
        this.calculator.classList.remove('lyric-mode');
        this.clearIntervals();
        this.display.classList.remove('typing-cursor');
        
        // Stop the audio
        this.audio.pause();
        this.audio.currentTime = 0;
        
        this.updateDisplay();
      }
      
      playNextLyric() {
        if (!this.isLyricMode) return;
        
        const lyric = this.lyrics[this.currentLyricIndex];
        this.typeLyric(lyric).then(() => {
          if (this.isLyricMode) {
            setTimeout(() => {
              // Check if this is the last lyric
              if (this.currentLyricIndex === this.lyrics.length - 1) {
                // Stop at the last lyric, don't delete it
                this.display.classList.remove('typing-cursor');
                return;
              }
              
              this.deleteLyric(lyric).then(() => {
                if (this.isLyricMode) {
                  this.currentLyricIndex = (this.currentLyricIndex + 1) % this.lyrics.length;
                  this.playNextLyric();
                }
              });
            }, lyric.holdTime);
          }
        });
      }
      
      typeLyric(lyric) {
        return new Promise(resolve => {
          let i = 0;
          this.display.textContent = '';
          this.display.classList.add('typing-cursor');
          
          this.typingInterval = setInterval(() => {
            if (i < lyric.text.length && this.isLyricMode) {
              this.display.textContent += lyric.text.charAt(i);
              i++;
            } else {
              clearInterval(this.typingInterval);
              this.display.classList.remove('typing-cursor');
              resolve();
            }
          }, lyric.typeSpeed);
        });
      }
      
      deleteLyric(lyric) {
        return new Promise(resolve => {
          let text = this.display.textContent;
          
          this.deletingInterval = setInterval(() => {
            if (text.length > 0 && this.isLyricMode) {
              text = text.slice(0, -1);
              this.display.textContent = text;
            } else {
              clearInterval(this.deletingInterval);
              resolve();
            }
          }, lyric.deleteSpeed);
        });
      }
      
      clearIntervals() {
        if (this.typingInterval) {
          clearInterval(this.typingInterval);
          this.typingInterval = null;
        }
        if (this.deletingInterval) {
          clearInterval(this.deletingInterval);
          this.deletingInterval = null;
        }
      }
    }
    
    document.addEventListener('DOMContentLoaded', () => {
      new Calculator();
    });