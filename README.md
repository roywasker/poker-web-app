# Poker Game Manager

אפליקציית ווב לניהול משחקי פוקר, מעקב אחר מאזני שחקנים וחישוב העברות כספים בסוף המשחק.

## תכונות עיקריות

- ניהול שחקנים
- יצירת משחקים חדשים
- מעקב אחר קניות וסכומי החזרה
- חישוב אוטומטי של העברות כספים בסוף המשחק
- צפייה בהיסטוריית משחקים
- מעקב אחר מאזני שחקנים
- ממשק משתמש מותאם למובייל

## טכנולוגיות

- React
- TypeScript
- Material UI
- Firebase (Firestore)

## התקנה

1. שכפל את המאגר:
```
git clone https://github.com/your-username/poker-web-app.git
cd poker-web-app
```

2. התקן את התלויות:
```
npm install
```

3. הגדר את הגדרות Firebase:
   - צור קובץ `.env` בתיקיית הפרויקט
   - הוסף את מפתחות ה-API של Firebase:
   ```
   REACT_APP_FIREBASE_API_KEY=your-api-key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   REACT_APP_FIREBASE_APP_ID=your-app-id
   ```

## הרצה בסביבת פיתוח

```
npm start
```

האפליקציה תרוץ בכתובת [http://localhost:3000](http://localhost:3000).

## בנייה לייצור

```
npm run build
```

הפקודה תיצור גרסת ייצור אופטימלית בתיקיית `build`.

## פריסה

ניתן לפרוס את האפליקציה בשירותים כמו Firebase Hosting, Vercel, Netlify או כל שירות אחסון סטטי אחר.

### פריסה ל-Firebase Hosting

1. התקן את Firebase CLI:
```
npm install -g firebase-tools
```

2. התחבר ל-Firebase:
```
firebase login
```

3. אתחל את הפרויקט:
```
firebase init
```

4. פרוס את האפליקציה:
```
firebase deploy
```

## מבנה הפרויקט

- `src/` - קוד המקור של האפליקציה
  - `assets/` - תמונות וקבצי מדיה
  - `components/` - קומפוננטות React משותפות
  - `data/` - לוגיקת גישה לנתונים ומודלים
  - `routes/` - הגדרות ניתוב
  - `screens/` - מסכי האפליקציה
  - `themes/` - הגדרות עיצוב
  - `types/` - הגדרות טיפוסים

- `public/` - קבצים סטטיים

## רישיון

MIT 