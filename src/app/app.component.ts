import { Component, OnInit } from '@angular/core';
import { FuzzySet } from './fuzzyset.js';
import { ServiceService } from './service.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  ngOnInit(): void {
    this.logic()
  }
  constructor(private service: ServiceService) { 

  }
  title = 'HEB';
  sorts =[]
  sortstring: any
  predicates = []
  key1:any;
  key2:any;
  editor:any;
  answerDiv:any;
  voiceBtn:any;
  textInput:any;
  submitBtn:any
  answerBox:any
  recognition:any
  a:any;

  logic()
  {
    const stopwords = ["of", "the", "a", "an", "any", "is", "can", "who", "what", "why", "whom"];
        this.editor = 
        "sorts\n" +
            "#product = {toothPaste, shampoo, milk}.\n" +
            "#aisle = {1,2,3,4,5}.\n" +
            "#price = {10, 25, 12}.\n" +
       "predicates\n" +
            "aisle(#product, #aisle).\n" +
            "productprice(#product, #price).\n" +
            "productavailable(#product).\n" +
        "rules\n" +
            "aisle(toothPaste, 2).\n" +
            "aisle(shampoo, 3).\n" +
            "aisle(milk, 4).\n" +
            "productavailable(toothPaste).\n" +
            "productavailable(milk).\n" +
            "productavailable(shampoo).\n" +
            "productprice(toothPaste, 10).\n" +
            "productprice(shampoo, 10).\n" +
            "productprice(milk, 12).\n"        
        // sorts
        var contstring = this.editor.split("sorts\n")[1].split("predicates\n");
        this.sortstring = contstring[0].split('.');
        this.sortstring.splice(-1, 1);
        this.sortstring = this.sortstring.map((d: string) => d.replace(/\n/g, '').trim()).forEach((d: string) => {
            var par = d.split("=");
            this.sorts[par[0].replace(/#/, '').trim()] = par[1].replace(/{|}/g, '').split(',').map((w: string) => w.trim())
        });
        // predicates
        contstring = contstring[1].split("rules\n");
        this.sortstring = contstring[0].split('.');
        this.sortstring.splice(-1, 1);
        this.sortstring.forEach((d: string) => {
            var part = d.replace(/\n/g, '').trim().split('(');
            var func = part[0];
            this.predicates[func] = {};
            var par = part[1].split(',').map((e: string) => e.replace(/#|\)/g, '').trim());
            var par1 = this.sorts[par[0]].slice();
            par1.push("X");
            par.splice(0, 1);
            par1.forEach((e: string) => {
                var strinh = (e == 'X' ? '' : (e + ' ')) + func;
                this.predicates[func][strinh] = func + "(" + e + ")";
                par.forEach((par2: string | number) => {
                    var temp = this.sorts[par2].slice();
                    temp.push("X");
                    temp.forEach((t: string) => {
                        var strinh = (e == 'X' ? '' : (e + ' ')) + func + (t == 'X' ? '' : (' ' + t));
                        // if (strinh != fubnc)
                        this.predicates[func][strinh] = func + "(" + e + "," + t + ")";
                    })
                });
            });
        });


        var all_predicates = [];
        for (var key1 in this.predicates) {
            if (this.predicates.hasOwnProperty(key1)) {
                for (var key2 in this.predicates[key1]) {
                    if (this.predicates[key1].hasOwnProperty(key2))
                        all_predicates.push(key2);
                }
            }

        }
        this.a = FuzzySet(all_predicates);
      
      console.log(all_predicates)
      
      
      // Speech recognition API
      // const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      // this.recognition = new SpeechRecognition();
      // this.recognition.lang = 'en-US';

      this.answerDiv = document.querySelector('#answer');
      this.voiceBtn = document.getElementById('voice-input-btn');
      this.textInput = document.getElementById('text-input');
      this.submitBtn = document.getElementById('submit-btn');
      this.answerBox = document.getElementById('answer-box');

      this.submitBtn.addEventListener('click', () => {
        const question = this.textInput.value;
        this.answerDiv.innerHTML = ''
        if (question.trim() === '') {
          this.answerBox.innerHTML = 'Please ask a question.';
          this.answerBox.style.display = 'block';
          return;
        }
        var trim_script = question.split(" ");
        trim_script = trim_script.filter((f: string) => !stopwords.includes(f));
        var queryQues = this.a.get(trim_script.join(" "), null, 0.5); 
        this.getAnswer(queryQues);
        
      });

      // Handle speech recognition
      // this.recognition.onresult = (event: { resultIndex: any; results: { [x: string]: { transcript: any; }[]; }; }) => {
      //   const resultIndex = event.resultIndex;
      //   const transcript = event.results[resultIndex][0].transcript;
      //   this.textInput.value = transcript;
        
      //   var trim_script = transcript.split(" ");
      //   trim_script = trim_script.filter((f: string) => !stopwords.includes(f));
      //   var queryQues = this.a.get(trim_script.join(" "), null, 0.5);
      //   console.log(queryQues);
      //   this.getAnswer(queryQues);
      // };

      // this.voiceBtn.addEventListener('click', this.startSpeechRecognition);

  }
  
  getAnswer(question: string[][] | null) {      
    if (question!=null) {
            var mainkey = question[0][1].replace('speak ','');
            var answerarr = mainkey.split(' ');
            answerarr.forEach(d => {
                this.key1 = (this.predicates[d] != undefined) ? d : this.key1;
            });
            //var key1 = answerarr.length>2? answerarr[1]:answerarr[0];
            this.key2 = mainkey;
            console.log(this.predicates[this.key1][this.key2]);
      

     var data = {
        action: "getQuery",
        query: this.predicates[this.key1][this.key2],
        editor: this.editor
      }
      this.service.getQuery(data).subscribe(
        {
          next: (response: any) => {
            const answer = response || 'Sorry, I could not find an answer.';
            this.answerDiv.innerHTML = answer;
          },
          error: (errorRes: any) => {
            console.log(errorRes);
            this.answerDiv.innerHTML = errorRes?.error?.text;
          }
        }
      )
    }
    }
  
    startSpeechRecognition() {
      this.recognition.start();
    }
    


}
