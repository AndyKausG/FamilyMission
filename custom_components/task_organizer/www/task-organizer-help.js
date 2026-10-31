/**
 * TaskOrganizer Help: the parents guide as in-app online help (German / French / English).
 *
 * Usable as a card (`type: custom:task-organizer-help`) and as a full-screen overlay that the
 * other cards open with `window.TaskOrganizerHelp.open(hass, 'chapter-id')`. The content is bundled in
 * this file (works offline); the language comes from `hass.language` (de, fr, en; fallback en).
 * The same text lives in docs/parents-guide.<lang>.md.
 *
 * Markup in the texts: **bold** and `code`. A block is a paragraph (string), a list (array of
 * strings) or a tip ({ tip: "..." }).
 */

// -- CONTENT-START (also read by the tool that generates docs/parents-guide.*.md) --
const HELP_CONTENT = {
  de: {
    title: "Elternratgeber",
    subtitle: "Wie TaskOrganizer bei euch zu Hause gut funktioniert",
    search: "Im Ratgeber suchen",
    toc: "Inhalt",
    close: "Schließen",
    clear: "Suche löschen",
    no_results: "Nichts gefunden. Versucht ein anderes Wort.",
    results: "{n} Kapitel gefunden",
    chapters: [
      { id: "basics", icon: "💡", title: "Die Grundidee", blocks: [
        "TaskOrganizer macht aus Haushaltsaufgaben kleine Missionen mit **sofortiger Rückmeldung**: Das Kind hakt etwas ab, hört einen Jingle und sieht seinen Ring wachsen. Genau diese Unmittelbarkeit trägt Kinder durch den Alltag.",
        [
          "**Eigener Fortschritt statt Wettbewerb:** Jedes Kind hat sein eigenes Monatsziel. Die Kacheln stehen in fester Reihenfolge, es gibt keine Rangliste unter Geschwistern.",
          "**Familienziel:** Gemeinsam füllt ihr die Familien-Rakete. Alle ziehen an einem Strang.",
          "**Belohnung erst sammeln, dann einlösen:** Punkte wandern in ein Guthaben, das im Shop gegen Belohnungen getauscht wird. Das lehrt Sparen und Vorfreude."
        ],
        "Die Wirkung hängt vor allem an euch Eltern: **konsequent** (Regeln gelten jeden Tag), **freundlich** (Ton statt Druck) und **gleichbleibend** (nicht heute streng und morgen großzügig). Die App ist das Werkzeug, ihr seid der Rahmen.",
        { tip: "Faustregel: lieber wenige Regeln, die zuverlässig gelten, als viele, die niemand durchhält." }
      ] },
      { id: "setup", icon: "🛠️", title: "Einrichtung in 10 Minuten", blocks: [
        [
          "**Kinderprofile + PIN:** Einstellungen-Karte, Bereich Kinder: Person als Kind aktivieren, Avatar und Farbe wählen, Geburtsjahr (oder Geburtstag) und eine 4-stellige Geheimzahl eintragen. Die PIN verhindert, dass Geschwister füreinander abhaken.",
          "**Eltern-Rolle:** Im selben Bereich legt ihr fest, wer freigeben, loben und Punkte vergeben darf. So bleibt das Wand-Tablet für Kinder harmlos.",
          "**Schnellstart:** Der Button 🚀 Kindermodus-Schnellstart schlägt altersgerechte Aufgaben, Punkte und Ziele vor und legt alles mit einem Klick an. Fünf Schritte, auch am Handy.",
          "**Tablet-Dashboard (Kiosk):** Die Kinder-Karte als Vollbild auf einem Wand-Tablet (zum Beispiel mit Fully Kiosk Browser, Querformat). Die Kinder tippen ihre Kachel, geben die PIN ein und sehen ihre Missionen.",
          "**Eigene Geräte (`mode: mine`):** Mit `mode: mine` zeigt die Karte direkt die Aufgaben der angemeldeten Person, ohne Kachel und PIN. Ideal für das Handy oder Tablet eines älteren Kindes.",
          "**Bonus-Auslöser:** Ein Bonus kann sich von selbst öffnen, etwa wenn die Spülmaschine fertig ist (Einstellungen-Karte, Bereich Bonus-Auslöser). Das Tablet kann ihn per Sprachausgabe ansagen.",
          "**Erinnerungen:** Pro Aufgabe lässt sich eine Uhrzeit festlegen. Ist die Aufgabe dann noch offen, gibt es ein Ereignis bzw. eine Benachrichtigung."
        ],
        { tip: "Plant für die Einrichtung 10 Minuten ein, und nehmt euch danach einen ruhigen Moment, um den Kindern das System zu erklären." }
      ] },
      { id: "ramp", icon: "🌱", title: "Die ersten Wochen (Rampup)", blocks: [
        "Ein guter Start entscheidet. Steigert langsam: Das System soll Lust machen, nicht überfordern.",
        [
          "**Woche 1–2:** nur wenige Missionen (Morgen, Abend, ein Tischdienst), **keine Abzüge**, viel Lob. Im Shop liegen kleine Belohnungen, die schon nach wenigen Tagen erreichbar sind. So erleben die Kinder früh: Es lohnt sich.",
          "**Woche 3–4:** Normalphase mit allen vorgesehenen Aufgaben. Ihr prüft Stichproben statt jede Aufgabe (die Stichproben-Quote ist pro Kind einstellbar).",
          "**Danach:** neue Elemente (neue Aufgabe, neue Belohnung, neues Ziel) höchstens alle 2–3 Wochen. Zu viel Neues auf einmal zerstört die Routine."
        ],
        "Kinder, die viel Struktur brauchen, profitieren besonders von festen Zeiten, wenigen Schritten pro Mission und sehr vorhersehbaren Abläufen. Startet bei ihnen bewusst kleiner und bleibt länger in der ersten Phase.",
        { tip: "Der Schnellstart kennt die Phasen „Start“ (Ziel: 60 % des Maximums) und „Normal“ (75 %). Der erste, angebrochene Monat wird anteilig berechnet." }
      ] },
      { id: "daily", icon: "📅", title: "Täglicher Ablauf", blocks: [
        "**Was die Kinder sehen:**",
        [
          "**Zeitfenster:** Aufgaben sind nur zur passenden Zeit aktiv. Davor zeigt ein Symbol, ab wann es losgeht.",
          "**Schritte:** Kleine Häkchen-Schritte (Anziehen, Bett machen). „Fertig!“ geht erst, wenn alle Schritte abgehakt sind.",
          "**Fertig:** gibt sofort Punkte, Konfetti und Ton, oder wartet auf eure Freigabe.",
          "**👫 Zusammen:** Wo erlaubt, machen mehrere Kinder eine Aufgabe gemeinsam. Die Punkte werden geteilt, dazu gibt es einen Team-Bonus.",
          "**Bonus:** freiwillige Zusatzaufgaben. Wer „Übernehmen“ tippt, reserviert sie für ein paar Minuten.",
          "**Shop:** Guthaben gegen Belohnungen tauschen und ein Sparziel wählen."
        ],
        "**Was ihr tut:**",
        [
          "**Freigaben:** In der Eltern-Karte bestätigt ihr, was eine Freigabe braucht (oder direkt per Push-Nachricht am Handy).",
          "**Loben:** Mit ❤️ Loben schickt ihr einen Sticker und ein paar Worte.",
          "**Spontan-Bonus:** ein einmaliger Zusatzjob („Brot holen“) in wenigen Taps.",
          "**Heute aussetzen:** Eine Aufgabe fällt heute aus (krank, Ausflug), ohne Punkte und ohne Minus.",
          "**Zurückstellen:** Die Aufgabe auf ein späteres Datum schieben.",
          "**Für Kind erledigen:** Ihr bucht eine erledigte Aufgabe nach, etwa wenn das Tablet nicht zur Hand war.",
          "**Rückgängig:** Falsch abgehakt? Der Eintrag lässt sich zurücknehmen, die Punkte werden wieder abgezogen."
        ]
      ] },
      { id: "approval", icon: "✅", title: "Freigabe, „Nicht fertig“ und „Geschummelt“", blocks: [
        "Manche Aufgaben brauchen eure Freigabe (pro Aufgabe einstellbar, dazu optionale Stichproben pro Kind). Dann zählt eine Erledigung erst, wenn ihr bestätigt.",
        [
          "**Freigeben:** Alles in Ordnung, die Punkte gehen aufs Konto.",
          "**Nicht fertig:** Es war gut gemeint, aber noch nicht ganz fertig, oder es wurde vergessen. Die Aufgabe ist wieder offen, **ohne Abzug**.",
          "**Geschummelt:** nur bei **bewusstem** Schummeln (abgehakt, aber nicht gemacht). Es gibt einen Abzug in Höhe der Aufgabenpunkte (einstellbar) und eine strenge Phase."
        ],
        "**Wichtig:** Abzug nur bei bewusstem Schummeln, **nie bei Vergessen**. Abzüge sind **privat**: Sie erscheinen nur in der eigenen Ansicht des Kindes, nie auf der Startseite oder vor den Geschwistern. Die **strenge Phase** (Standard: 7 Tage, jede Aufgabe braucht eine Freigabe) **endet automatisch**.",
        { tip: "Gespräch statt Strafe: Sprecht kurz und ruhig darüber, was passiert ist und wie es besser klappt. Der Abzug ist nur der Anlass für das Gespräch." }
      ] },
      { id: "rewards", icon: "🎁", title: "Belohnungen richtig wählen", blocks: [
        [
          "**Erlebnisse und Privilegien zuerst:** ein gemeinsamer Ausflug, den Spieleabend bestimmen, 30 Minuten später ins Bett. Dinge und Bildschirmzeit kommen danach, sparsam.",
          "**Preisstufen:** klein (10–30 Punkte, in wenigen Tagen erreichbar), mittel (50–100, in 1–2 Wochen), groß (150 und mehr, am Monatsende).",
          "**Sparziel in 1–2 Wochen erreichbar:** Was zu weit weg ist, motiviert nicht. Wählt das Sparziel so, dass es mit normalem Einsatz in ein bis zwei Wochen klappt.",
          "**Gemeinsam auswählen:** Fragt die Kinder, was sie wirklich wollen, und tauscht das Angebot regelmäßig aus. Sonst wird es langweilig."
        ],
        { tip: "Bildschirmzeit als Belohnung macht sie zum Maßstab für alles andere. Wenn ihr sie anbietet, dann nur klein und begrenzt." }
      ] },
      { id: "praise", icon: "❤️", title: "Loben", blocks: [
        [
          "**Konkret:** „Du hast den Tisch ganz allein gedeckt, sogar mit Servietten!“ statt „Gut gemacht“.",
          "**Zeitnah:** Innerhalb weniger Minuten wirkt Lob. Am nächsten Tag kaum noch.",
          "**Ehrlich:** Lobt, was wirklich gelungen ist. Anstrengung und Dranbleiben zählen mehr als das Ergebnis."
        ],
        "Der Button **❤️ Loben** ergänzt das persönliche Wort, er ersetzt es nicht. Die Kinder sehen den Sticker beim nächsten Öffnen ihrer Ansicht groß, ohne Punkte und ohne Vergleich. Wenn ihr zu Hause seid, sagt es zusätzlich direkt.",
        { tip: "Auch ohne Button wirkt vieles: ein kurzer Blick, ein Daumen hoch, eine Umarmung." }
      ] },
      { id: "goals", icon: "🚀", title: "Monatsziele, Familien-Rakete, Ring über 100 %", blocks: [
        [
          "**Monatsziel:** Jedes Kind hat sein eigenes Punkteziel. Der Ring um den Avatar zeigt den Fortschritt.",
          "**Ring über 100 %:** Wer mehr schafft, dreht weitere Runden in dunkleren Farben. Mehr ist erlaubt, aber nie nötig.",
          "**Familien-Rakete:** Alle Punkte zusammen füllen die Rakete bis zum Familienziel (zum Beispiel ein Pizza-Abend). Es zählen nur bestätigte Aufgabenpunkte, keine Boni und keine Abzüge.",
          "**Monatswechsel:** Am Monatsanfang werden die Monatspunkte zurückgesetzt und der Monat archiviert. Das **Guthaben im Shop bleibt** erhalten."
        ],
        { tip: "Setzt das Ziel so, dass ein Kind mit normalem Einsatz etwa 75 % des Maximums erreicht. So bleibt es erreichbar, ohne dass jeder Tag perfekt sein muss." }
      ] },
      { id: "fade", icon: "🌿", title: "Ausschleichen", blocks: [
        "Ziel ist **Gewohnheit, nicht Punkte-Sammeln**. Wenn eine Routine 4 Wochen stabil läuft, führt ihr sie schrittweise von der Belohnung weg:",
        [
          "Zuerst weniger Punkte für die Aufgabe (zum Beispiel von 3 auf 2).",
          "Dann die Schritte der Mission entfernen. Das Kind kennt sie inzwischen.",
          "Schließlich die Aufgabe ohne Punkte weiterlaufen lassen oder ganz aus der App nehmen."
        ],
        "Gebt die frei gewordene Aufmerksamkeit an eine neue Gewohnheit weiter, aber immer nur an eine zur Zeit (siehe Rampup).",
        { tip: "Sagt es den Kindern vorher: „Das Zähneputzen klappt super. Ab nächster Woche gibt es dafür keine Punkte mehr, das könnt ihr schon!“" }
      ] },
      { id: "faq", icon: "❓", title: "Häufige Fragen / Probleme", blocks: [
        [
          "**Mein Kind hakt alles ab, ohne es zu tun.** Schaltet für diese Aufgaben die Freigabe oder Stichproben ein und schaut kurz hin. Sprecht ehrlich darüber. Nur bei bewusstem Schummeln gibt es „Geschummelt“, ruhig und mit Gespräch. Sichtbare Schritte (zum Beispiel „Bett gemacht“) helfen beim Prüfen.",
          "**Streit um den Bonus.** Wer „Übernehmen“ tippt, hat ein paar Minuten Vorrang. Ihr könnt Aufgaben mit „Zusammen“ erlauben, einen Spontan-Bonus gezielt einem Kind geben oder ein Mindestalter setzen.",
          "**Kind will keine Punkte mehr.** Das ist nach einigen Wochen normal. Erneuert die Belohnungen, setzt mehr auf Erlebnisse, schleicht gut laufende Routinen aus und fragt, was dem Kind fehlt. Punkte sind nie ein Druckmittel.",
          "**Krankheit / Ferien.** Pausiert Aufgaben im Task-Editor (Pause bis Datum) oder nutzt „Heute aussetzen“ für einzelne Tage. Am Geburtstag sind Pflichten automatisch frei. Passt bei langen Pausen das Monatsziel an.",
          "**Geschwister unterschiedlich alt.** Aufgaben haben ein Mindestalter, jedes Kind hat ein eigenes Ziel. Haltet den Aufwand pro Minute vergleichbar, nicht die Zahl der Aufgaben. Ältere können Jüngeren mit „Zusammen“ helfen.",
          "**Tablet zeigt eine alte Version.** Das ist der Browser-Cache. Seite neu laden (im Fully Kiosk Browser: Cache leeren und neu laden), in der Companion-App den Frontend-Cache leeren. Nach einem Update von TaskOrganizer erscheint die neue Version nach einem Neustart von Home Assistant und einem Neuladen."
        ]
      ] }
    ]
  },
  fr: {
    title: "Guide des parents",
    subtitle: "Comment faire fonctionner TaskOrganizer à la maison",
    search: "Rechercher dans le guide",
    toc: "Sommaire",
    close: "Fermer",
    clear: "Effacer la recherche",
    no_results: "Rien trouvé. Essayez un autre mot.",
    results: "{n} chapitre(s) trouvé(s)",
    chapters: [
      { id: "basics", icon: "💡", title: "L'idée de base", blocks: [
        "TaskOrganizer transforme les tâches ménagères en petites missions avec un **retour immédiat** : l'enfant coche une tâche, entend un jingle et voit son anneau grandir. C'est cette immédiateté qui porte les enfants au quotidien.",
        [
          "**Progresser à son rythme plutôt que rivaliser :** chaque enfant a son propre objectif mensuel. Les vignettes restent dans un ordre fixe, il n'y a pas de classement entre frères et sœurs.",
          "**Objectif familial :** ensemble, vous remplissez la fusée de la famille. Tout le monde tire dans le même sens.",
          "**D'abord économiser, ensuite échanger :** les points vont dans un solde qui s'échange dans la boutique contre des récompenses. Cela apprend à épargner et à se réjouir à l'avance."
        ],
        "L'effet dépend surtout de vous, les parents : **cohérents** (les règles valent tous les jours), **bienveillants** (le ton plutôt que la pression) et **constants** (pas strict aujourd'hui et généreux demain). L'application est l'outil, vous êtes le cadre.",
        { tip: "Règle d'or : mieux vaut peu de règles qui tiennent vraiment que beaucoup que personne ne tient." }
      ] },
      { id: "setup", icon: "🛠️", title: "Installation en 10 minutes", blocks: [
        [
          "**Profils d'enfants + code PIN :** carte Réglages, section Enfants : activer la personne comme enfant, choisir l'avatar et la couleur, saisir l'année de naissance (ou la date d'anniversaire) et un code secret à 4 chiffres. Le PIN évite qu'un frère ou une sœur coche à la place d'un autre.",
          "**Rôle parent :** dans la même section, vous définissez qui peut valider, féliciter et attribuer des points. La tablette murale reste ainsi sans danger pour les enfants.",
          "**Démarrage rapide :** le bouton 🚀 Démarrage rapide du mode enfants propose des tâches, des points et des objectifs adaptés à l'âge et crée tout en un clic. Cinq étapes, aussi sur téléphone.",
          "**Tableau de bord tablette (kiosque) :** la carte Enfants en plein écran sur une tablette murale (par exemple avec Fully Kiosk Browser, en mode paysage). Les enfants touchent leur vignette, saisissent leur PIN et voient leurs missions.",
          "**Appareils personnels (`mode: mine`) :** avec `mode: mine`, la carte affiche directement les tâches de la personne connectée, sans vignette ni PIN. Idéal pour le téléphone ou la tablette d'un enfant plus grand.",
          "**Déclencheurs de bonus :** un bonus peut s'ouvrir tout seul, par exemple quand le lave-vaisselle a terminé (carte Réglages, section Déclencheurs de bonus). La tablette peut l'annoncer à voix haute.",
          "**Rappels :** une heure peut être définie pour chaque tâche. Si la tâche est alors encore ouverte, un événement ou une notification est envoyé."
        ],
        { tip: "Prévoyez 10 minutes pour l'installation, puis prenez un moment calme pour expliquer le système aux enfants." }
      ] },
      { id: "ramp", icon: "🌱", title: "Les premières semaines (montée en charge)", blocks: [
        "Un bon début est décisif. Augmentez lentement : le système doit donner envie, pas submerger.",
        [
          "**Semaines 1–2 :** seulement quelques missions (matin, soir, un service de table), **aucune déduction**, beaucoup d'encouragements. La boutique propose de petites récompenses accessibles en quelques jours. Les enfants constatent vite que cela vaut la peine.",
          "**Semaines 3–4 :** phase normale avec toutes les tâches prévues. Vous contrôlez par sondage plutôt que chaque tâche (le taux de contrôle se règle par enfant).",
          "**Ensuite :** de nouveaux éléments (nouvelle tâche, nouvelle récompense, nouvel objectif) au plus toutes les 2–3 semaines. Trop de nouveautés d'un coup détruisent la routine."
        ],
        "Les enfants qui ont besoin de beaucoup de structure profitent surtout d'horaires fixes, de peu d'étapes par mission et de déroulements très prévisibles. Commencez plus petit avec eux et restez plus longtemps dans la première phase.",
        { tip: "Le démarrage rapide connaît les phases « Début » (objectif : 60 % du maximum) et « Normal » (75 %). Le premier mois, entamé, est calculé au prorata." }
      ] },
      { id: "daily", icon: "📅", title: "Le déroulement au quotidien", blocks: [
        "**Ce que voient les enfants :**",
        [
          "**Plages horaires :** les tâches ne sont actives qu'à l'heure prévue. Avant, un symbole indique à partir de quand.",
          "**Étapes :** de petites étapes à cocher (s'habiller, faire le lit). « Terminé ! » n'est possible que lorsque toutes les étapes sont cochées.",
          "**Terminé :** donne tout de suite des points, des confettis et un son, ou attend votre validation.",
          "**👫 Ensemble :** là où c'est autorisé, plusieurs enfants font une tâche ensemble. Les points sont partagés, avec un bonus d'équipe en plus.",
          "**Bonus :** des tâches supplémentaires facultatives. Celui qui touche « Prendre » la réserve pour quelques minutes.",
          "**Boutique :** échanger le solde contre des récompenses et choisir un objectif d'épargne."
        ],
        "**Ce que vous faites :**",
        [
          "**Validations :** dans la carte Parents, vous confirmez ce qui demande une validation (ou directement par notification sur le téléphone).",
          "**Féliciter :** avec ❤️ Féliciter, vous envoyez un autocollant et quelques mots.",
          "**Bonus spontané :** un petit travail ponctuel (« aller chercher le pain ») en quelques touches.",
          "**Suspendre aujourd'hui :** une tâche saute aujourd'hui (maladie, sortie), sans points et sans pénalité.",
          "**Reporter :** repousser la tâche à une date ultérieure.",
          "**Valider pour l'enfant :** vous enregistrez après coup une tâche faite, par exemple si la tablette n'était pas à portée de main.",
          "**Annuler :** coché par erreur ? L'entrée peut être annulée, les points sont retirés."
        ]
      ] },
      { id: "approval", icon: "✅", title: "Validation, « Pas fini » et « Triché »", blocks: [
        "Certaines tâches demandent votre validation (réglable par tâche, avec des contrôles par sondage facultatifs par enfant). Une réalisation ne compte alors qu'une fois que vous avez confirmé.",
        [
          "**Valider :** tout est en ordre, les points vont sur le compte.",
          "**Pas fini :** c'était bien intentionné mais pas tout à fait terminé, ou oublié. La tâche est de nouveau ouverte, **sans déduction**.",
          "**Triché :** seulement en cas de triche **délibérée** (coché mais pas fait). Il y a une déduction égale aux points de la tâche (réglable) et une phase stricte."
        ],
        "**Important :** une déduction uniquement en cas de triche délibérée, **jamais pour un oubli**. Les déductions sont **privées** : elles n'apparaissent que dans la vue personnelle de l'enfant, jamais sur l'écran d'accueil ni devant les frères et sœurs. La **phase stricte** (par défaut : 7 jours, chaque tâche demande une validation) **se termine automatiquement**.",
        { tip: "Discussion plutôt que punition : parlez calmement et brièvement de ce qui s'est passé et de la façon de mieux faire. La déduction n'est que l'occasion de cette discussion." }
      ] },
      { id: "rewards", icon: "🎁", title: "Bien choisir les récompenses", blocks: [
        [
          "**D'abord des expériences et des privilèges :** une sortie ensemble, choisir la soirée jeux, se coucher 30 minutes plus tard. Les objets et le temps d'écran viennent après, avec modération.",
          "**Niveaux de prix :** petit (10–30 points, atteignable en quelques jours), moyen (50–100, en 1–2 semaines), grand (150 et plus, en fin de mois).",
          "**Objectif d'épargne atteignable en 1–2 semaines :** ce qui est trop loin ne motive pas. Choisissez l'objectif pour qu'il soit atteint en une à deux semaines avec un effort normal.",
          "**Choisir ensemble :** demandez aux enfants ce qu'ils veulent vraiment et renouvelez l'offre régulièrement. Sinon cela devient lassant."
        ],
        { tip: "Le temps d'écran comme récompense en fait l'étalon de toutes les autres. Si vous en proposez, seulement en petite quantité et limité." }
      ] },
      { id: "praise", icon: "❤️", title: "Féliciter", blocks: [
        [
          "**Concret :** « Tu as mis la table tout seul, même les serviettes ! » plutôt que « Bien joué ».",
          "**Rapidement :** quelques minutes après, un compliment agit. Le lendemain, presque plus.",
          "**Sincère :** félicitez ce qui est vraiment réussi. L'effort et la persévérance comptent plus que le résultat."
        ],
        "Le bouton **❤️ Féliciter** complète le mot personnel, il ne le remplace pas. Les enfants voient l'autocollant en grand à la prochaine ouverture de leur vue, sans points et sans comparaison. Si vous êtes à la maison, dites-le aussi directement.",
        { tip: "Même sans bouton, beaucoup de choses marchent : un regard, un pouce levé, un câlin." }
      ] },
      { id: "goals", icon: "🚀", title: "Objectifs mensuels, fusée de la famille, anneau au-delà de 100 %", blocks: [
        [
          "**Objectif mensuel :** chaque enfant a son propre objectif de points. L'anneau autour de l'avatar montre la progression.",
          "**Anneau au-delà de 100 % :** celui qui fait plus tourne d'autres tours dans des couleurs plus foncées. Plus est permis, mais jamais nécessaire.",
          "**Fusée de la famille :** tous les points ensemble remplissent la fusée jusqu'à l'objectif familial (par exemple une soirée pizza). Seuls les points de tâches confirmés comptent, pas les bonus ni les déductions.",
          "**Changement de mois :** au début du mois, les points mensuels sont remis à zéro et le mois est archivé. Le **solde de la boutique est conservé**."
        ],
        { tip: "Fixez l'objectif pour qu'un enfant atteigne environ 75 % du maximum avec un effort normal. Il reste atteignable sans que chaque jour doive être parfait." }
      ] },
      { id: "fade", icon: "🌿", title: "Réduire progressivement", blocks: [
        "Le but est l'**habitude, pas la collecte de points**. Quand une routine tient depuis 4 semaines, éloignez-la peu à peu de la récompense :",
        [
          "D'abord moins de points pour la tâche (par exemple de 3 à 2).",
          "Puis retirer les étapes de la mission. L'enfant les connaît désormais.",
          "Enfin laisser la tâche se poursuivre sans points ou la retirer complètement de l'application."
        ],
        "Reportez l'attention libérée sur une nouvelle habitude, mais une seule à la fois (voir montée en charge).",
        { tip: "Dites-le d'abord aux enfants : « Le brossage des dents marche très bien. À partir de la semaine prochaine, il n'y aura plus de points pour cela, vous savez déjà le faire ! »" }
      ] },
      { id: "faq", icon: "❓", title: "Questions fréquentes / problèmes", blocks: [
        [
          "**Mon enfant coche tout sans rien faire.** Activez la validation ou les contrôles par sondage pour ces tâches et jetez un coup d'œil. Parlez-en honnêtement. « Triché » seulement en cas de triche délibérée, calmement et avec une discussion. Des étapes visibles (par exemple « lit fait ») aident à contrôler.",
          "**Dispute à propos du bonus.** Celui qui touche « Prendre » a la priorité quelques minutes. Vous pouvez autoriser « Ensemble » pour des tâches, donner un bonus spontané à un enfant précis ou fixer un âge minimum.",
          "**L'enfant ne veut plus de points.** C'est normal après quelques semaines. Renouvelez les récompenses, misez davantage sur les expériences, réduisez progressivement les routines qui marchent bien et demandez ce qui manque à l'enfant. Les points ne sont jamais un moyen de pression.",
          "**Maladie / vacances.** Mettez des tâches en pause dans l'éditeur de tâches (pause jusqu'à une date) ou utilisez « Suspendre aujourd'hui » pour des jours isolés. Le jour d'anniversaire, les obligations sont automatiquement suspendues. Pour de longues pauses, adaptez l'objectif mensuel.",
          "**Frères et sœurs d'âges différents.** Les tâches ont un âge minimum, chaque enfant a son propre objectif. Gardez l'effort par minute comparable, pas le nombre de tâches. Les plus grands peuvent aider les plus petits avec « Ensemble ».",
          "**La tablette affiche une ancienne version.** C'est le cache du navigateur. Rechargez la page (dans Fully Kiosk Browser : vider le cache et recharger), dans l'application Companion videz le cache du frontend. Après une mise à jour de TaskOrganizer, la nouvelle version apparaît après un redémarrage de Home Assistant et un rechargement."
        ]
      ] }
    ]
  },
  en: {
    title: "Parents guide",
    subtitle: "How to make TaskOrganizer work well at home",
    search: "Search the guide",
    toc: "Contents",
    close: "Close",
    clear: "Clear search",
    no_results: "Nothing found. Try another word.",
    results: "{n} chapter(s) found",
    chapters: [
      { id: "basics", icon: "💡", title: "The basic idea", blocks: [
        "TaskOrganizer turns household chores into small missions with **instant feedback**: the child ticks something off, hears a jingle and watches their ring grow. That immediacy is what carries children through the day.",
        [
          "**Own progress instead of competition:** every child has their own monthly goal. The tiles stay in a fixed order, and there is no ranking among siblings.",
          "**Family goal:** together you fill the family rocket. Everyone pulls in the same direction.",
          "**Collect first, then redeem:** points go into a balance that is exchanged for rewards in the shop. This teaches saving and looking forward to something."
        ],
        "The effect depends mostly on you as parents: **consistent** (the rules apply every day), **friendly** (tone instead of pressure) and **steady** (not strict today and generous tomorrow). The app is the tool, you are the frame.",
        { tip: "Rule of thumb: better a few rules that reliably apply than many that nobody keeps up." }
      ] },
      { id: "setup", icon: "🛠️", title: "Setup in 10 minutes", blocks: [
        [
          "**Kid profiles + PIN:** settings card, Kids section: enable the person as a kid, pick an avatar and colour, enter the birth year (or birthday) and a 4-digit secret number. The PIN stops siblings from ticking things off for each other.",
          "**Parent role:** in the same section you decide who may approve, praise and give points. That keeps the wall tablet harmless for kids.",
          "**Quick start:** the 🚀 Kids mode quick start button proposes age-appropriate tasks, points and goals and creates everything with one click. Five steps, also on a phone.",
          "**Tablet dashboard (kiosk):** the kids card in full screen on a wall tablet (for example with Fully Kiosk Browser, landscape). Kids tap their tile, enter the PIN and see their missions.",
          "**Own devices (`mode: mine`):** with `mode: mine` the card shows the tasks of the logged-in person right away, without tiles and PIN. Ideal for the phone or tablet of an older child.",
          "**Bonus triggers:** a bonus can open by itself, for example when the dishwasher has finished (settings card, Bonus triggers section). The tablet can announce it by voice.",
          "**Reminders:** a time can be set per task. If the task is still open then, an event or notification is sent."
        ],
        { tip: "Plan 10 minutes for the setup, and afterwards take a quiet moment to explain the system to the kids." }
      ] },
      { id: "ramp", icon: "🌱", title: "The first weeks (ramp-up)", blocks: [
        "A good start decides a lot. Increase slowly: the system should make kids want to take part, not overwhelm them.",
        [
          "**Week 1–2:** only a few missions (morning, evening, one table duty), **no deductions**, lots of praise. The shop holds small rewards that can be reached within a few days. This way kids experience early on that it pays off.",
          "**Week 3–4:** normal phase with all planned tasks. You check spot samples instead of every task (the sample rate can be set per kid).",
          "**After that:** new elements (a new task, a new reward, a new goal) at most every 2–3 weeks. Too much new at once destroys the routine."
        ],
        "Kids who need a lot of structure benefit most from fixed times, few steps per mission and very predictable routines. Start smaller with them and stay in the first phase longer.",
        { tip: "The quick start knows the phases “Start” (goal: 60 % of the maximum) and “Normal” (75 %). The first, partial month is calculated pro rata." }
      ] },
      { id: "daily", icon: "📅", title: "The daily routine", blocks: [
        "**What the kids see:**",
        [
          "**Time windows:** tasks are only active at the right time. Before that, a symbol shows when it starts.",
          "**Steps:** small steps to tick (get dressed, make the bed). “Done!” only works once all steps are ticked.",
          "**Done:** gives points, confetti and a sound right away, or waits for your approval.",
          "**👫 Together:** where allowed, several kids do a task together. The points are shared, plus a team bonus.",
          "**Bonus:** voluntary extra tasks. Whoever taps “Take it” reserves it for a few minutes.",
          "**Shop:** exchange the balance for rewards and choose a savings goal."
        ],
        "**What you do:**",
        [
          "**Approvals:** in the parents card you confirm what needs approval (or directly from a push notification on your phone).",
          "**Praise:** with ❤️ Praise you send a sticker and a few words.",
          "**Spontaneous bonus:** a one-off extra job (“fetch bread”) in a few taps.",
          "**Skip today:** a task drops out today (sick, outing), with no points and no penalty.",
          "**Postpone:** move the task to a later date.",
          "**Complete for the kid:** you record a task that was done, for example when the tablet was not at hand.",
          "**Undo:** ticked by mistake? The entry can be taken back and the points are deducted again."
        ]
      ] },
      { id: "approval", icon: "✅", title: "Approval, “Not done” and “Cheated”", blocks: [
        "Some tasks need your approval (set per task, plus optional spot checks per kid). A completion only counts once you confirm.",
        [
          "**Approve:** everything is fine, the points go to the account.",
          "**Not done:** well meant but not quite finished, or forgotten. The task is open again, **without a deduction**.",
          "**Cheated:** only for **deliberate** cheating (ticked but not done). There is a deduction equal to the task points (adjustable) and a strict phase."
        ],
        "**Important:** a deduction only for deliberate cheating, **never for forgetting**. Deductions are **private**: they only appear in the kid's own view, never on the home screen or in front of siblings. The **strict phase** (default: 7 days, every task needs approval) **ends automatically**.",
        { tip: "Talk instead of punishing: briefly and calmly discuss what happened and how it can go better. The deduction is only the occasion for the conversation." }
      ] },
      { id: "rewards", icon: "🎁", title: "Choosing rewards well", blocks: [
        [
          "**Experiences and privileges first:** a trip together, choosing game night, staying up 30 minutes later. Things and screen time come after that, sparingly.",
          "**Price levels:** small (10–30 points, reachable within a few days), medium (50–100, in 1–2 weeks), large (150 and more, by the end of the month).",
          "**Savings goal reachable in 1–2 weeks:** what is too far away does not motivate. Pick the savings goal so that normal effort gets there in one to two weeks.",
          "**Choose together:** ask the kids what they really want and rotate the offer regularly. Otherwise it gets boring."
        ],
        { tip: "Screen time as a reward turns it into the yardstick for everything else. If you offer it, keep it small and limited." }
      ] },
      { id: "praise", icon: "❤️", title: "Praising", blocks: [
        [
          "**Specific:** “You set the table all by yourself, even with napkins!” instead of “Well done”.",
          "**Promptly:** praise works within minutes. The next day it hardly does.",
          "**Honestly:** praise what really worked. Effort and sticking with it count more than the result."
        ],
        "The **❤️ Praise** button complements the personal word, it does not replace it. Kids see the sticker big the next time they open their view, without points and without comparison. When you are home, say it in person, too.",
        { tip: "Plenty works without a button: a quick look, a thumbs up, a hug." }
      ] },
      { id: "goals", icon: "🚀", title: "Monthly goals, family rocket, ring above 100 %", blocks: [
        [
          "**Monthly goal:** every child has their own points goal. The ring around the avatar shows progress.",
          "**Ring above 100 %:** whoever does more spins further laps in darker colours. More is allowed, but never necessary.",
          "**Family rocket:** all points together fill the rocket up to the family goal (for example a pizza night). Only confirmed task points count, no bonuses and no deductions.",
          "**Month change:** at the start of the month the monthly points are reset and the month is archived. The **shop balance is kept**."
        ],
        { tip: "Set the goal so that a child with normal effort reaches about 75 % of the maximum. That keeps it reachable without every day having to be perfect." }
      ] },
      { id: "fade", icon: "🌿", title: "Phasing out", blocks: [
        "The aim is **habit, not collecting points**. When a routine has run stably for 4 weeks, lead it step by step away from the reward:",
        [
          "First fewer points for the task (for example from 3 to 2).",
          "Then remove the steps of the mission. The child knows them by now.",
          "Finally let the task continue without points, or take it out of the app altogether."
        ],
        "Pass the attention that frees up to a new habit, but only one at a time (see ramp-up).",
        { tip: "Tell the kids beforehand: “Brushing teeth works great. From next week there are no points for it anymore, you can do that already!”" }
      ] },
      { id: "faq", icon: "❓", title: "Frequent questions / problems", blocks: [
        [
          "**My child ticks everything off without doing it.** Turn on approval or spot checks for those tasks and take a quick look. Talk about it honestly. Use “Cheated” only for deliberate cheating, calmly and with a conversation. Visible steps (for example “bed made”) make checking easier.",
          "**Arguments about the bonus.** Whoever taps “Take it” has priority for a few minutes. You can allow “Together” for tasks, give a spontaneous bonus to one specific kid, or set a minimum age.",
          "**Kid does not want points any more.** That is normal after a few weeks. Renew the rewards, focus more on experiences, phase out routines that run well and ask what the child is missing. Points are never a means of pressure.",
          "**Illness / holidays.** Pause tasks in the task editor (pause until a date) or use “Skip today” for single days. On the birthday, duties are automatically off. For long breaks, adjust the monthly goal.",
          "**Siblings of different ages.** Tasks have a minimum age, every child has their own goal. Keep the effort per minute comparable, not the number of tasks. Older kids can help younger ones with “Together”.",
          "**Tablet shows an old version.** That is the browser cache. Reload the page (in Fully Kiosk Browser: clear the cache and reload), in the companion app clear the frontend cache. After a TaskOrganizer update, the new version appears after a Home Assistant restart and a reload."
        ]
      ] }
    ]
  }
};
// -- CONTENT-END --

const HELP_LANGS = ['de', 'fr', 'en'];

/** Escapes text for safe use inside innerHTML templates. */
function escHelp(value) {
  return String(value === undefined || value === null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** Escapes a text and wraps the search term in <mark>. */
function hlHelp(text, query) {
  const raw = String(text);
  if (!query) return escHelp(raw);
  const lower = raw.toLowerCase();
  let out = '';
  let pos = 0;
  for (let at = lower.indexOf(query); at !== -1; at = lower.indexOf(query, pos)) {
    out += escHelp(raw.slice(pos, at)) + '<mark>' + escHelp(raw.slice(at, at + query.length)) + '</mark>';
    pos = at + query.length;
  }
  return out + escHelp(raw.slice(pos));
}

/** **bold**, `code` and search highlighting for one text. */
function inlineHelp(text, query) {
  return String(text).split('**').map((part, i) => {
    const html = part.split('`').map((seg, j) => (j % 2 ? `<code>${hlHelp(seg, query)}</code>` : hlHelp(seg, query))).join('');
    return i % 2 ? `<strong>${html}</strong>` : html;
  }).join('');
}

/** Plain text of a block (for the search). */
function plainHelp(block) {
  if (Array.isArray(block)) return block.join(' ');
  if (block && block.tip) return block.tip;
  return String(block);
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: "task-organizer-help",
  name: "Task Organizer: Help",
  description: "Parents guide with table of contents, search and collapsible chapters (de, fr, en).",
  preview: false,
});

class TaskOrganizerHelp extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._hass = null;
    this._config = {};
    this._query = '';
    this._open = new Set();
    this._anchor = null;
    this._built = false;
    this._onKey = (ev) => { if (ev.key === 'Escape' && this.hasAttribute('overlay')) this.close(); };
    this.shadowRoot.addEventListener('click', (ev) => this._onClick(ev));
    this.shadowRoot.addEventListener('input', (ev) => this._onInput(ev));
    this.shadowRoot.addEventListener('toggle', (ev) => this._onToggle(ev), true);
  }

  /**
   * Opens the help as a full-screen overlay (used by the buttons of the other cards).
   * @param {object} hass - The Home Assistant object (language).
   * @param {string} [anchor] - Chapter id to open and scroll to.
   */
  static open(hass, anchor) {
    const existing = document.querySelector('task-organizer-help[overlay]');
    if (existing) existing.close();
    const el = document.createElement('task-organizer-help');
    el.setAttribute('overlay', '');
    el.hass = hass;
    el.goTo(anchor);
    document.body.appendChild(el);
    return el;
  }

  static getStubConfig() { return { type: "custom:task-organizer-help" }; }
  static getLayoutOptions() { return { grid_columns: 12, grid_rows: "auto", grid_min_columns: 6 }; }
  getCardSize() { return 8; }

  setConfig(config) {
    this._config = { ...(config || {}) };
    if (this._config.anchor) this.goTo(this._config.anchor);
    if (this._built) this._build();
  }

  set hass(hass) {
    const changed = !this._hass || this._hass.language !== (hass && hass.language);
    this._hass = hass;
    if (changed && this._built) this._build();
  }

  connectedCallback() {
    if (!this._built) this._build();
    if (this.hasAttribute('overlay')) {
      document.addEventListener('keydown', this._onKey);
      this._previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const btn = this.shadowRoot.getElementById('close');
      if (btn) btn.focus();
      this._scrollToAnchor();
    }
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this._onKey);
    if (this.hasAttribute('overlay')) document.body.style.overflow = this._previousOverflow || '';
  }

  close() {
    if (this.parentNode) this.parentNode.removeChild(this);
  }

  /** Language of the content: de, fr or en (fallback en). */
  get lang() {
    const l = ((this._hass && this._hass.language) || (this._config && this._config.language) || 'en').substring(0, 2).toLowerCase();
    return HELP_LANGS.includes(l) ? l : 'en';
  }

  get content() { return HELP_CONTENT[this.lang]; }

  /** Opens a chapter and scrolls to it. */
  goTo(anchor) {
    if (!anchor) return;
    this._anchor = anchor;
    this._open.add(anchor);
    if (this._built) {
      this._query = '';
      const input = this.shadowRoot.getElementById('q');
      if (input) input.value = '';
      this._renderList();
      this._scrollToAnchor();
    }
  }

  _scrollToAnchor() {
    if (!this._anchor) return;
    const el = this.shadowRoot.getElementById('ch-' + this._anchor);
    if (el && el.scrollIntoView) setTimeout(() => el.scrollIntoView({ block: 'start' }), 0);
  }

  _matches(chapter, query) {
    if (!query) return true;
    const hay = [chapter.title].concat(chapter.blocks.map(plainHelp)).join(' ').toLowerCase();
    return hay.includes(query);
  }

  _onClick(ev) {
    const el = ev.target.closest ? ev.target.closest('[data-action]') : null;
    if (!el) return;
    if (el.dataset.action === 'close') this.close();
    else if (el.dataset.action === 'toc') this.goTo(el.dataset.id);
    else if (el.dataset.action === 'clear') {
      this._query = '';
      const input = this.shadowRoot.getElementById('q');
      if (input) { input.value = ''; input.focus(); }
      this._renderList();
    }
  }

  _onInput(ev) {
    if (ev.target.id !== 'q') return;
    this._query = ev.target.value.trim().toLowerCase();
    this._renderList();
    const scroll = this.shadowRoot.querySelector('.scroll');
    if (scroll) scroll.scrollTop = 0;
  }

  _onToggle(ev) {
    const el = ev.target;
    if (!el || !el.dataset || !el.dataset.chapter || this._query) return;
    if (el.open) this._open.add(el.dataset.chapter); else this._open.delete(el.dataset.chapter);
  }

  _renderBlock(block, query) {
    if (Array.isArray(block)) return `<ul>${block.map(li => `<li>${inlineHelp(li, query)}</li>`).join('')}</ul>`;
    if (block && block.tip) return `<p class="tip"><span aria-hidden="true">💡</span> ${inlineHelp(block.tip, query)}</p>`;
    return `<p>${inlineHelp(block, query)}</p>`;
  }

  _renderList() {
    const c = this.content;
    const query = this._query;
    const list = this.shadowRoot.getElementById('list');
    const status = this.shadowRoot.getElementById('status');
    const clear = this.shadowRoot.getElementById('clear');
    if (!list) return;
    const shown = c.chapters.map((ch, i) => ({ ch, n: i + 1 })).filter(({ ch }) => this._matches(ch, query));
    list.innerHTML = shown.map(({ ch, n }) => `
      <details class="chapter" id="ch-${ch.id}" data-chapter="${ch.id}" ${query || this._open.has(ch.id) ? 'open' : ''}>
        <summary><span class="num">${n}</span><span class="ico" aria-hidden="true">${ch.icon}</span><span class="ttl">${inlineHelp(ch.title, query)}</span></summary>
        <div class="chbody">${ch.blocks.map(b => this._renderBlock(b, query)).join('')}</div>
      </details>`).join('') || `<p class="empty">${escHelp(c.no_results)}</p>`;
    if (status) status.textContent = query ? c.results.replace('{n}', shown.length) : '';
    if (clear) clear.hidden = !query;
    this.shadowRoot.querySelectorAll('[data-action="toc"]').forEach(btn => {
      btn.classList.toggle('dim', !!query && !shown.some(({ ch }) => ch.id === btn.dataset.id));
    });
  }

  _build() {
    const c = this.content;
    this._built = true;
    if (!this._open.size && !this._anchor && !this.hasAttribute('overlay')) this._open.add(c.chapters[0].id);
    const overlay = this.hasAttribute('overlay');
    const toc = c.chapters.map((ch, i) =>
      `<button class="toc-item" data-action="toc" data-id="${ch.id}"><span class="num">${i + 1}</span>${escHelp(ch.title)}</button>`).join('');
    this.shadowRoot.innerHTML = `
      <style>${this._styles()}</style>
      ${overlay ? '<div class="scrim" data-action="close"></div>' : ''}
      <section class="panel" role="${overlay ? 'dialog' : 'region'}" aria-label="${escHelp(c.title)}" ${overlay ? 'aria-modal="true"' : ''}>
        <header class="head">
          <div class="head-row">
            <div class="head-text"><h1>❓ ${escHelp(c.title)}</h1><div class="sub">${escHelp(c.subtitle)}</div></div>
            ${overlay ? `<button class="close" id="close" data-action="close" aria-label="${escHelp(c.close)}" title="${escHelp(c.close)}">✕</button>` : ''}
          </div>
          <div class="search">
            <input id="q" type="search" autocomplete="off" placeholder="${escHelp(c.search)}" aria-label="${escHelp(c.search)}" value="${escHelp(this._query)}">
            <button class="clear" id="clear" data-action="clear" aria-label="${escHelp(c.clear)}" title="${escHelp(c.clear)}" hidden>✕</button>
          </div>
          <div class="status" id="status" role="status" aria-live="polite"></div>
        </header>
        <div class="scroll">
          <nav class="toc" aria-label="${escHelp(c.toc)}"><div class="toc-title">${escHelp(c.toc)}</div><div class="toc-list">${toc}</div></nav>
          <div id="list"></div>
        </div>
      </section>`;
    this._renderList();
  }

  _styles() {
    return `
      :host { display: block; --h-bg: var(--card-background-color, #fff); --h-text: var(--primary-text-color, #1d1d1f); --h-sub: var(--secondary-text-color, #5f6368);
        --h-line: var(--divider-color, #dadce0); --h-accent: var(--primary-color, #03a9f4); --h-soft: var(--secondary-background-color, #f1f3f4); color: var(--h-text); }
      @media (prefers-color-scheme: dark) {
        :host { --h-bg: var(--card-background-color, #1c1c1e); --h-text: var(--primary-text-color, #e8e8ea); --h-sub: var(--secondary-text-color, #a0a0a8);
          --h-line: var(--divider-color, #3a3a3e); --h-soft: var(--secondary-background-color, #2a2a2e); }
      }
      * { box-sizing: border-box; }
      :host([overlay]) { position: fixed; inset: 0; z-index: 20000; display: flex; align-items: stretch; justify-content: center; }
      .scrim { position: absolute; inset: 0; background: rgba(0,0,0,0.55); }
      .panel { position: relative; display: flex; flex-direction: column; background: var(--h-bg); color: var(--h-text); width: 100%; min-height: 0; border-radius: var(--ha-card-border-radius, 12px); }
      :host([overlay]) .panel { border-radius: 0; height: 100%; }
      .head { flex: none; padding: 16px 16px 10px; border-bottom: 1px solid var(--h-line); background: var(--h-bg); border-radius: inherit; }
      .head-row { display: flex; align-items: flex-start; gap: 12px; }
      .head-text { flex: 1; min-width: 0; }
      h1 { margin: 0; font-size: 22px; line-height: 1.25; }
      .sub { color: var(--h-sub); font-size: 14px; margin-top: 2px; }
      .close { flex: none; width: 44px; height: 44px; border-radius: 22px; border: 1px solid var(--h-line); background: var(--h-soft); color: var(--h-text); font-size: 20px; cursor: pointer; }
      .search { position: relative; margin-top: 12px; }
      #q { width: 100%; height: 48px; padding: 0 44px 0 14px; border-radius: 12px; border: 2px solid var(--h-line); background: var(--h-soft); color: var(--h-text); font-size: 16px; font-family: inherit; }
      #q::-webkit-search-cancel-button, #q::-webkit-search-decoration { -webkit-appearance: none; appearance: none; display: none; }
      #q:focus { outline: none; border-color: var(--h-accent); }
      .clear { position: absolute; right: 4px; top: 4px; width: 40px; height: 40px; border: none; background: transparent; color: var(--h-sub); font-size: 18px; cursor: pointer; }
      .clear[hidden] { display: none; }
      .status { min-height: 18px; margin-top: 6px; font-size: 13px; color: var(--h-sub); }
      .scroll { flex: 1; min-height: 0; overflow-y: auto; padding: 12px 16px 24px; -webkit-overflow-scrolling: touch; }
      :host(:not([overlay])) .scroll { overflow: visible; }
      .toc { margin-bottom: 14px; padding: 12px; border-radius: 12px; background: var(--h-soft); }
      .toc-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--h-sub); margin-bottom: 6px; }
      .toc-list { display: grid; grid-template-columns: 1fr; gap: 2px; }
      .toc-item { display: flex; align-items: center; gap: 10px; min-height: 44px; padding: 0 8px; border: none; border-radius: 8px; background: transparent; color: var(--h-text); font-size: 15px; font-family: inherit; text-align: left; cursor: pointer; }
      .toc-item:hover { background: color-mix(in srgb, var(--h-accent) 12%, transparent); }
      .toc-item.dim { opacity: 0.35; }
      .num { flex: none; width: 24px; height: 24px; border-radius: 12px; display: inline-grid; place-items: center; background: color-mix(in srgb, var(--h-accent) 18%, transparent); font-size: 13px; font-weight: 700; }
      .chapter { border: 1px solid var(--h-line); border-radius: 12px; margin-bottom: 10px; background: var(--h-bg); scroll-margin-top: 8px; }
      .chapter[open] { border-color: color-mix(in srgb, var(--h-accent) 45%, var(--h-line)); }
      summary { display: flex; align-items: center; gap: 10px; min-height: 52px; padding: 8px 12px; cursor: pointer; list-style: none; font-size: 17px; font-weight: 700; }
      summary::-webkit-details-marker { display: none; }
      summary::after { content: '›'; margin-left: auto; font-size: 24px; color: var(--h-sub); transition: transform 0.15s; }
      .chapter[open] > summary::after { transform: rotate(90deg); }
      .ico { flex: none; font-size: 22px; }
      .ttl { min-width: 0; overflow-wrap: anywhere; }
      .chbody { padding: 0 14px 12px 14px; font-size: 15px; line-height: 1.55; }
      .chbody p { margin: 8px 0; }
      .chbody ul { margin: 8px 0; padding-left: 20px; }
      .chbody li { margin: 6px 0; }
      .tip { padding: 10px 12px; border-radius: 10px; background: color-mix(in srgb, #F9A825 14%, var(--h-bg)); border-left: 4px solid #F9A825; }
      code { padding: 1px 5px; border-radius: 5px; background: var(--h-soft); font-size: 0.92em; }
      mark { background: #FFE082; color: #1d1d1f; border-radius: 3px; padding: 0 1px; }
      .empty { padding: 24px 8px; text-align: center; color: var(--h-sub); }
      @media (min-width: 900px) {
        :host([overlay]) { align-items: center; }
        :host([overlay]) .panel { width: min(920px, calc(100vw - 48px)); height: min(90vh, 900px); border-radius: 16px; box-shadow: 0 16px 48px rgba(0,0,0,0.45); }
        .head { padding: 20px 24px 12px; }
        .scroll { padding: 16px 24px 28px; }
        .toc-list { grid-template-columns: 1fr 1fr; column-gap: 12px; }
        .chbody { font-size: 16px; }
      }
      @media (prefers-reduced-motion: reduce) { summary::after { transition: none; } }
    `;
  }
}

window.TaskOrganizerHelp = TaskOrganizerHelp;
customElements.define('task-organizer-help', TaskOrganizerHelp);
