-- CreateTable
CREATE TABLE "word_pronunciations" (
    "id" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accent" TEXT NOT NULL,
    "pronunciation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "word_pronunciations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sentence_pronunciations" (
    "id" TEXT NOT NULL,
    "sentenceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accent" TEXT NOT NULL,
    "pronunciation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sentence_pronunciations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "word_pronunciations" ADD CONSTRAINT "word_pronunciations_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "words"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "word_pronunciations" ADD CONSTRAINT "word_pronunciations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sentence_pronunciations" ADD CONSTRAINT "sentence_pronunciations_sentenceId_fkey" FOREIGN KEY ("sentenceId") REFERENCES "sentences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sentence_pronunciations" ADD CONSTRAINT "sentence_pronunciations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
