# คีย์โค้ดเดอร์ (KeyCoder)

เว็บไซต์ : [keycoder.college](https://keycoder.college)

เป็นหนึ่งในโครงการการแข่งขันพัฒนาโปรแกรมคอมพิวเตอร์แห่งประเทศไทย (The 27th National Software Contest หรือ NSC 2025)

## การติดตั้ง (Installation)

1. ติดตั้ง [Bun](https://bun.com) (สามารถดูได้ที่ [Bun Installation](https://bun.com/docs/installation))
2. เปิดไฟล์ "init.bat" แล้วรอจนกว่าโปรแกรมจะทำงานเสร็จสิ้น
2. เปิดไฟล์ "run_public_build.bat" แล้วรอจนกว่าโปรแกรมจะทำงานเสร็จสิ้น
3. เปิดไฟล์ "run_public_start.bat" และไฟล์ "start.bat" ตามลำดับ
4. เว็บไซต์จะโฮสต์บนพอร์ต 3000 ซึ่งสามารถตั้งค่าได้ที่ไฟล์ ".env" ตรงช่องคำว่า "PORT"
5. ทดลองเข้าเว็บไซต์ [localhost:3000](http://localhost:3000)

## เฟรมเวิร์คที่ใช้ (Frameworks)

- [Prisma](https://www.prisma.io/) - ใช้ในการจัดการฐานข้อมูล (Database)
- [Elysia](https://elysiajs.com/) - ใช้ในการโฮสต์ API (Backend)
- [Next.js](https://nextjs.org/) - ใช้ในการโฮสต์ Frontend
- [React](https://react.dev/) - ใช้การทำ Frontend
- [shadcn/ui](https://ui.shadcn.com/) - เป็นชุด UI Component สำหรับการทำ Frontend
- [Tail Wind CSS](https://tailwindcss.com/) - ใช้ในการจัดการเรื่องการตกแต่งหน้าเว็บไซต์

## แจ้งให้ทราบ (Notifications)
- ตัวเว็บไซต์มี Error ในการ Logout อย่างไม่ทราบสาเหตุ (แต่ภายใน [keycoder.college](https://keycoder.college) สามารถทำงานได้อย่างปกติ)
- โค้ดที่อยู่ใน GitHub โจทย์และเนื้อหาคอร์สพื้นฐาน Python อาจยังไม่สมบูรณ์ (แนะนำให้เข้า [keycoder.college](https://keycoder.college))
- ส่วนของ Frontend (ส่วนแสดงผล) ที่ต้องสื่อสารกับ Server ไม่ได้เชื่อมกับ localhost:PORT แต่เป็น keycoder.college

## ผู้มีส่วนร่วมในโครงการ (Contributor)

1. นายนันทพัทธ์ แก้วจา (Nantapat Kaewja)
2. นายกวี เกษตรภิบาล (Kawee Kasetpibaln)
3. นายณัชกุล ตันบุญเอก (Nuchkul Tunboonaek)
