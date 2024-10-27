# Node.js 이미지를 베이스로 사용
FROM node:18

# 작업 디렉토리 설정
WORKDIR /app

# 패키지 파일 복사 및 의존성 설치
COPY package*.json ./
RUN npm install

# 모든 소스 코드 복사
COPY . .

# 빌드 (필요시)
RUN npm run build  # 빌드가 필요한 경우에만 추가

# 포트 개방
EXPOSE 3000

# 서버 실행
CMD ["npm", "start"]