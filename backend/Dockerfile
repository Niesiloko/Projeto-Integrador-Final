# Receita para rodar a API num container (usada pelo Render).
# Duas etapas: a 1ª compila com Maven; a 2ª só roda o .jar (imagem final menor, sem o Maven).

# ---- 1ª etapa: compilar ----
FROM maven:3.9-eclipse-temurin-21 AS compilacao
WORKDIR /app
# copia primeiro só o pom.xml: se ele não mudar, o Docker reaproveita as dependências já baixadas
COPY pom.xml .
RUN mvn -q dependency:go-offline
COPY src ./src
RUN mvn -q -DskipTests package

# ---- 2ª etapa: rodar ----
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=compilacao /app/target/conectaevent-0.0.1-SNAPSHOT.jar app.jar

# fuso de Brasília e perfil "nuvem" (application-nuvem.properties)
ENV TZ=America/Sao_Paulo
ENV SPRING_PROFILES_ACTIVE=nuvem

EXPOSE 8080
# MaxRAMPercentage: o Java usa no máximo 75% da memória do plano; SerialGC gasta menos memória
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-XX:+UseSerialGC", "-jar", "app.jar"]
