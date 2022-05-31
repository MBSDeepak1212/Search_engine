const express = require('express');
const ejs = require('ejs');
const path = require('path');
var fs = require('fs');

const app = express();
app.use(express.json());
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.static(path.join(__dirname, "/views")));
app.use(express.static(path.join(__dirname, "/files")));

const PORT = process.env.PORT || 3000;

app.get('/', (req,res)=>{
    res.render("index");
})

app.get('/search', (req,res)=>{
    const query = req.query;
    var question = query.question;

    setTimeout(()=>{
        var files = fs.readFileSync('./files/Keywords.txt', 'utf-8');
        var keywords = files.split('\n');
        files = fs.readFileSync('./files/magnitude.txt', 'utf-8');
        const magnitude = files.split('\n');
        files = fs.readFileSync('./files/IDF.txt', 'utf-8');
        const idf = files.split('\n');
        files = fs.readFileSync('./files/TF_IDF.txt', 'utf-8');
        const tf_idf = files.split('\n');
        files = fs.readFileSync('./files/problems_titles.txt', 'utf-8');
        const problems_titles = files.split(/\r?\n/g);
        files = fs.readFileSync('./files/problems_url.txt', 'utf-8');
        const problems_url = files.split(/\r?\n/g);

        m = problems_titles.length;
        n = keywords.length;
        var arr = new Array(m); // create an empty array of length n
        for (var i = 0; i < m; i++) {
            arr[i] = new Array(n); // make each element an array
        }
        for(let i=0;i<m;i++){
            for(let j=0;j<n;j++){
                arr[i][j]=0;
            }
        }

        for(let i=0;i<tf_idf.length;i++){
            var temp = tf_idf[i].split(' ');
            arr[parseInt(temp[0])][parseInt(temp[1])] += parseFloat(temp[2]);
        }

        question = question.replace(/[^a-zA-Z0-9 ]/g, ' ');
        question = question.toLocaleLowerCase();
        var arr_temp = question.split(' ');
        
        var dict_keywords = {};
        for(let i=0;i<keywords.length;i++){
            dict_keywords[keywords[i]] = 0.0;
        }

        for (let j=0;j<arr_temp.length;j++){
            if(keywords.includes(arr_temp[j])){
                dict_keywords[arr_temp[j]] += 1;
            }
        }

        var divide = 0;
        for (let j=0;j<keywords.length;j++){
            if(dict_keywords[keywords[j]]){
                divide += 1;
            }        
        }

        var sum = 0;
        for (let j=0;j<keywords.length;j++){
            dict_keywords[keywords[j]] /= divide;
            sum += dict_keywords[keywords[j]]*dict_keywords[keywords[j]];
        }

        sum = Math.sqrt(sum);
        var result = [];
        for(let i=1;i<=m;i++){
            var temp = 0;
            for(let j=0;j<n;j++){
                arr[i-1][j] *= dict_keywords[keywords[j]];
                temp += arr[i-1][j];
            }
            temp /= magnitude[i-1]*sum;
            result.push({temp,i});
        }

        result.sort(function(a,b){return b.temp-a.temp});
        // console.log(result);
        
        var ans = [];
        // console.log(ans);
        var k = 5;
        for(let j = 0;j<k;j++){
            temp = result[j].i;
            // console.log(temp);
            var question1 = fs.readFileSync('./problems/problem_text_'+temp+'.txt','utf8');
            question1 = question1.replace(/[^a-zA-Z0-9.? ]/g, ' ');

            ans.push({
                    title:problems_titles[temp],
                    url:problems_url[temp],
                    statement: question1,
                })

        }

        res.json(ans)

    },0);
    

});

app.listen(PORT,()=>{
    console.log("Server is running on port"+PORT);
});

