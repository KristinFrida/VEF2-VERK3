# Vefforritun 2, 2025, verkefni 3, unnið í tíma

Sækja pakka, búa til gagnagrunn og keyra:

```bash
yarn
createdb vef2-2025-v3-unnid-i-tima
# setja upp .env skrá, sjá .env.example
npx prisma db push
yarn dev
```
Fyrir gerðir:

- `GET /categories` skilar lista af flokkum:
  - `200 OK` skilað með gögnum á JSON formi.
  - `500 Internal Error` skilað ef villa kom upp.
- `GET /categories/:slug` skilar stökum flokki:
  - `200 OK` skilað með gögnum ef flokkur er til.
  - `404 Not Found` skilað ef flokkur er ekki til.
  - `500 Internal Error` skilað ef villa kom upp.
- `POST /category` býr til nýjan flokk:
  - `201 Created` (eða `200 OK` sem var áður hér) skilað ásamt upplýsingum um flokk.
  - `400 Bad Request` skilað ef gögn sem send inn eru ekki rétt (vantar gögn, gögn á röngu formi eða innihald þeirra ólöglegt).
  - `500 Internal Error` skilað ef villa kom upp.
- `PATCH /category/:slug` uppfærir flokk:
  - `200 OK` skilað með uppfærðum flokk ef gekk.
  - `400 Bad Request` skilað ef gögn sem send inn eru ekki rétt.
  - `404 Not Found` skilað ef flokkur er ekki til.
  - `500 Internal Error` skilað ef villa kom upp.
- `DELETE /category/:slug` eyðir flokk:
  - `204 No Content` skilað ef gekk.
  - `404 Not Found` skilað ef flokkur er ekki til.
  - `500 Internal Error` skilað ef villa kom upp.
  
- `GET /questions` nær í allar spurningar:
  - `200 OK` skilað með öllum spurningum í JSON formi
  - `500 Internal Error` skilað ef villa kom upp.
-  `GET /questions/:id` nær í ákveðna spurningu:
  - `200 OK` skilað með gögnum ef spurning er til.
  - `404 Not Found` skilað ef spurning er ekki til.
  - `500 Internal Error` skilað ef villa kom upp.
-  `GET /categories/:slug/questions` nær í allar spurningar í tilteknum flokki:
  - `200 OK` skilað með lista af spurningum í flokknum.
  - `404 Not Found`skilað ef flokkur er ekki til
  - `500 Internal Error` skilað ef villa kom upp.
-  `POST /categories/:slug/questions` býr til nýja spurningu í flokk:
  - `201 Created` skilað ásamt upplýsingum um nýja spurningu.
  - `400 Bad Request` skilað ef gögn sem send inn eru ekki rétt (vantar gögn, röng uppsetning, ólöglegt innihald).
  - `404 Not Found`skilað ef flokkur er ekki til
  - `500 Internal Error` skilað ef villa kom upp.
-  `PATCH /questions/:id` uppfærir spurningu:
  - `200 OK` skilað með uppfærðri spurningu ef tókst.
  - `400 Bad Request` skilað ef gögn sem send inn eru ekki rétt
  - `404 Not Found` skilað ef spurning er ekki til.
  - `500 Internal Error` skilað ef villa kom upp.
-  `DELETE /questions/:id` Eyður spurningu:
  - `204 No Content` skilað ef eyðing tókst
  - `404 Not Found` skilað ef spurning er ekki til. 
  - `500 Internal Error` skilað ef villa kom upp.