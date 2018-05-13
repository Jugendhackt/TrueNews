import spacy
import MySQLdb as mdb
#from spacy.lang.de.examples import sentences

word_dict = {}
nlp = spacy.load('de_core_news_sm')
con = mdb.connect("10.23.42.27", "mm", "truenews01", "truenews")

with con:
    cur = con.cursor()
    cur.execute('SELECT * FROM news WHERE date(Zeit)="2018-04-24"')




    rows = list(cur.fetchall())
    print(type(rows))
    for j in range(0,len(rows)):
        words = set()
        doc = nlp(rows[j][4])
        for token in doc:
            type = token.pos_
            if type == "NOUN":
                if token.text not in word_dict:
                    word_dict[token.text]=[]
                word_dict[token.text].append(j)
                words.add(token.text)
        rows[j] = rows[j]+(words,)
    for i in range(0, len(rows)):#go through all texts
        intersec = {}
        for j in range(0, len(rows[i][7])):#go through all words in our text i
            word = rows[i][7][j]
            for text_id in word_dict[word]:
                if text_id not in intersec:
                    intersec[text_id] = 0
                intersec[text_id]+=1
        sortMe = list(intersec.items())
        sortMe.sort(key=lambda tup: tup[1])
        firstSmaller=len(sortMe)
        for j in range(0, len(sortMe)):
            if sortMe[j][1]<0:
                firstSmaller = j
                break
        sortMe = sortMe[:firstSmaller]
        print(rows[i][3])
        print(sortMe)




#            cur.execute("UPDATE FROM news SET " + score + " WHERE " + row)

doc = nlp(rows[1][4])
for token in doc:
    type = token.pos_
    if type == "NOUN":
        words.append(token.text)
print(words)
