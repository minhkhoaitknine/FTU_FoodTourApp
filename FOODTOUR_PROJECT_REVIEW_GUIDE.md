# FoodTour App - Hướng Dẫn Review Dự Án

## Mục Lục

1. [Tổng Quan Dự Án](#1-tổng-quan-dự-án)
2. [Bảng Tổng Hợp Feature](#2-bảng-tổng-hợp-feature)
3. [Onboarding Cho Thành Viên Mới](#3-onboarding-cho-thành-viên-mới)
4. [User Flow Chính](#4-user-flow-chính)
5. [Flow Review 7-10 Phút](#5-flow-review-7-10-phút)
6. [Kịch Bản Lời Nói](#6-kịch-bản-lời-nói)
7. [Phân Chia Vai Trò Trong Nhóm](#7-phân-chia-vai-trò-trong-nhóm)
8. [Điểm Mạnh Nên Nhấn Mạnh](#8-điểm-mạnh-nên-nhấn-mạnh)
9. [Câu Hỏi Giảng Viên Có Thể Hỏi](#9-câu-hỏi-giảng-viên-có-thể-hỏi)
10. [Checklist Trước Khi Review](#10-checklist-trước-khi-review)
11. [Lưu Ý Trước Khi Demo](#11-lưu-ý-trước-khi-demo)
12. [Review Nhanh Trong 3 Phút](#12-review-nhanh-trong-3-phút)

## 1. Tổng Quan Dự Án

| Nội dung | Tóm tắt |
| --- | --- |
| FoodTour App là gì? | Ứng dụng web giúp người đi du lịch tại Việt Nam tìm quán ăn, xem bản đồ và tạo lịch trình food tour theo ngân sách, thời gian, sở thích và phương tiện. |
| Vấn đề giải quyết | Du khách thường mất thời gian chọn quán, sắp xếp tuyến đi, kiểm tra chi phí và lưu lại lịch trình. App gom các bước này vào một luồng rõ ràng. |
| Người dùng mục tiêu | Du khách nội địa/quốc tế, nhóm bạn đi du lịch, sinh viên cần demo sản phẩm du lịch ẩm thực. |
| Giá trị nổi bật | Có dữ liệu nhiều thành phố du lịch Việt Nam, có map, có bộ gợi ý tour, có lưu lịch trình, favorite, review và quản trị dữ liệu. |
| Công nghệ chính | Next.js dùng để làm cả giao diện và API; PostgreSQL lưu dữ liệu; Prisma giúp app làm việc với database; Leaflet/OpenStreetMap hiển thị bản đồ; Tailwind CSS tạo giao diện. |

### 1.1 Role Trong Hệ Thống

| Role | Ai dùng? | Quyền chính |
| --- | --- | --- |
| `USER` | Người dùng bình thường | Đăng nhập, xem nhà hàng, tạo tour, chỉnh tour, lưu tour, favorite, viết review. |
| `MODERATOR` | Người kiểm duyệt nội dung | Vào khu vực moderation để publish/hide/flag review. |
| `ADMIN` | Người quản trị hệ thống | Quản lý thống kê, nhà hàng, người dùng, review và phân quyền. |

### 1.2 Dữ Liệu Demo Có Sẵn

| Nhóm dữ liệu | Số lượng/ghi chú |
| --- | --- |
| Thành phố | 10: Ha Noi, Ho Chi Minh City, Da Nang, Hoi An, Hue, Nha Trang, Da Lat, Can Tho, Phu Quoc, Sa Pa |
| Nhà hàng | 60 nhà hàng demo hư cấu |
| Menu item | Khoảng 240 món |
| User | 100 user demo |
| Review | 300 review demo |
| Food tour | 40 tour demo |
| Background music | Các file nhạc thật trong folder `music` |

**Quan trọng:** Nhà hàng và dữ liệu demo là **hư cấu**, dùng cho trình bày dự án, không nên nói là dữ liệu nhà hàng thật.

### 1.3 Cấu Trúc Hệ Thống Ở Mức Dễ Hiểu

| Phần | Nằm ở đâu trong dự án | Vai trò |
| --- | --- | --- |
| Giao diện người dùng | `src/app/*`, `src/components/*` | Các màn hình như dashboard, restaurants, map, tour generator, admin. |
| Backend/API | `src/app/api/*` | Nhận request từ giao diện, kiểm tra dữ liệu, đọc/ghi database. |
| Business logic | `src/services/*` | Xử lý nghiệp vụ: lọc nhà hàng, tạo tour, favorite, review, admin, routing. |
| Database schema | `prisma/schema.prisma` | Định nghĩa bảng User, City, Restaurant, Review, Favorite, FoodTour, ModerationAction và một số bảng legacy. |
| Seed data | `prisma/seed.ts` | Tạo dữ liệu demo để trình bày và kiểm thử. |
| Kiểm tra tự động | `src/**/*.test.ts`, `scripts/preflight.ts` | Kiểm tra recommendation, route distance, asset resolver, dữ liệu seed và môi trường. |

### 1.4 Các Trang Và API Chính

| Nhóm | Trang/API chính | Ý nghĩa khi demo |
| --- | --- | --- |
| Public/Auth | `/`, `/login`, `/register`, `/api/auth/login`, `/api/auth/register`, `/api/auth/logout`, `/api/auth/me` | Có luồng vào app và xác thực tài khoản. |
| Dashboard | `/dashboard` | Màn hình chính sau login, ưu tiên latest saved tour. |
| Restaurants | `/restaurants`, `/restaurants/:slug`, `/api/restaurants`, `/api/restaurants/:id`, `/api/restaurants/:id/menu`, `/api/restaurants/:id/reviews` | Khám phá, lọc và xem chi tiết nhà hàng. |
| Map | `/map`, `/api/maps/route` | Hiển thị marker và route estimate. |
| Food tours | `/tour-generator`, `/tours`, `/tours/:id`, `/api/food-tours`, `/api/food-tours/:id`, `/api/food-tours/:id/clone` | Tạo, lưu, xem, clone, xoá và chỉnh tour. |
| Recommendation | `/api/recommendations/generate`, `/api/food-tours/generate` | Tạo gợi ý bằng rule-based engine. |
| Favorites/Reviews | `/favorites`, `/api/favorites`, `/api/favorites/:restaurantId`, `/api/reviews/:id` | Lưu quán yêu thích và quản lý review cá nhân. |
| Background music | `/api/background-music`, `/api/background-music/:track` | Player toàn app đọc file nhạc thật từ folder `music`. |
| Admin/Moderation | `/admin`, `/api/admin/dashboard`, `/api/admin/restaurants`, `/api/admin/users`, `/api/admin/reviews` | Quản trị dữ liệu và kiểm duyệt review theo role. |
| Health | `/api/health` | Kiểm tra server kết nối được database. |

## 2. Bảng Tổng Hợp Feature

### 2.1 Tài Khoản Và Đăng Nhập

| STT | Feature | Người sử dụng | Mục đích | Cách sử dụng | Kết quả mong đợi | Điểm nổi bật khi review |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Đăng ký | Người dùng mới | Tạo tài khoản cá nhân | Vào `/register`, nhập tên, email, mật khẩu | Tài khoản được tạo và chuyển vào dashboard | Có backend thật, không chỉ là giao diện giả |
| 2 | Đăng nhập | USER, MODERATOR, ADMIN | Truy cập khu vực cá nhân | Vào `/login`, nhập email/password hoặc bấm demo account | User vào dashboard, admin/moderator có thêm nút quản trị | Có cookie bảo mật `httpOnly`, không lưu token trong localStorage |
| 3 | Đăng xuất | Người đã đăng nhập | Kết thúc phiên làm việc | Bấm logout trên dashboard | Session bị xoá | Luồng đăng nhập/đăng xuất hoàn chỉnh |
| 4 | Phân quyền | USER, MODERATOR, ADMIN | Chặn truy cập sai quyền | Thử user thường vào `/admin` | User thường bị chuyển về dashboard hoặc API trả 403 | Có role rõ ràng, phù hợp hệ thống thật |

### 2.2 Khám Phá Nhà Hàng Và Món Ăn

| STT | Feature | Người sử dụng | Mục đích | Cách sử dụng | Kết quả mong đợi | Điểm nổi bật khi review |
| --- | --- | --- | --- | --- | --- | --- |
| 5 | Danh sách nhà hàng | Tất cả người dùng | Khám phá địa điểm ăn uống | Vào `/restaurants` | Hiển thị danh sách nhà hàng, ảnh, giá, rating, thành phố | Dữ liệu đến từ database, có phân trang |
| 6 | Tìm kiếm/lọc | Tất cả người dùng | Tìm quán phù hợp nhanh hơn | Nhập từ khoá, chọn city/type/price/rating | URL đổi theo filter và danh sách cập nhật | Có nhiều tiêu chí thực tế cho du lịch ẩm thực |
| 7 | Phân trang | Tất cả người dùng | Xem toàn bộ danh sách, không bị giới hạn 12 item | Bấm Previous/Next hoặc số trang | Chuyển được giữa các trang | Giải quyết vấn đề dữ liệu nhiều hơn màn hình |
| 8 | Chi tiết nhà hàng | Tất cả người dùng | Xem thông tin trước khi chọn | Mở card nhà hàng | Xem menu, giá, giờ mở cửa, review, ghi chú văn hoá | Trang chi tiết có đủ thông tin quyết định |
| 9 | Ảnh demo | Tất cả người dùng | Giúp giao diện dễ hiểu và hấp dẫn | Xem list/detail/tour | Hiển thị ảnh thành phố, món ăn, nhà hàng | Có asset resolver để fallback khi thiếu ảnh |

### 2.3 Map Và Vị Trí

| STT | Feature | Người sử dụng | Mục đích | Cách sử dụng | Kết quả mong đợi | Điểm nổi bật khi review |
| --- | --- | --- | --- | --- | --- | --- |
| 10 | Smart Food Map | Tất cả người dùng | Xem nhà hàng theo vị trí | Vào `/map` | Map OpenStreetMap hiển thị marker nhà hàng | Có map thật, không phải ảnh tĩnh |
| 11 | My Location | Tất cả người dùng | Quay map về vị trí thiết bị | Bấm nút định vị trên map | Map zoom về vị trí hiện tại nếu browser cho phép | Gần với trải nghiệm Google Maps |
| 12 | Lọc trên map | Tất cả người dùng | So sánh nhà hàng theo thành phố/loại/quán | Search hoặc chọn filter trong map | Marker và list đồng bộ | Dễ demo vì list và marker phản ứng cùng nhau |
| 13 | Route preview line | Tất cả người dùng | Xem đường nối ước lượng giữa các điểm | Bấm Show route line | Hiện đường xanh nối các stop đầu tiên sau filter | App ghi rõ đây là preview ước lượng, không phải dẫn đường thật |

### 2.4 Tạo Và Quản Lý Food Tour

| STT | Feature | Người sử dụng | Mục đích | Cách sử dụng | Kết quả mong đợi | Điểm nổi bật khi review |
| --- | --- | --- | --- | --- | --- | --- |
| 14 | Tour generator | USER | Tạo lịch trình ăn uống theo điều kiện | Vào `/tour-generator`, chọn city, budget, người, phương tiện, sở thích | Tour được generate và lưu | Engine rule-based có xét budget, khoảng cách, giờ mở cửa, sở thích |
| 15 | Gợi ý có lý do | USER | Hiểu vì sao quán được chọn | Xem kết quả tour/tour detail | Mỗi stop có reason/note | Không phải random; có giải thích quyết định |
| 16 | Lưu tour | USER | Xem lại lịch trình sau này | Generate tour xong hoặc vào `/tours` | Tour nằm trong lịch sử của user hiện tại | Dữ liệu scoped theo user |
| 17 | Chỉnh tour thủ công | USER | Người dùng không phụ thuộc hoàn toàn vào gợi ý | Mở tour detail, bấm Edit plan | Đổi tên, thêm/xoá stop, đổi thứ tự, đổi giờ, đổi nhà hàng, đổi cost/note | Điểm rất nên nhấn mạnh: app hỗ trợ cả gợi ý và quyền kiểm soát của user |
| 18 | Clone tour | USER | Tạo bản sao để thử phương án khác | Bấm Clone ở tour detail | Có tour mới dạng bản sao | Hữu ích khi so sánh lịch trình |
| 19 | Xoá tour | USER | Dọn lịch sử | Bấm Delete ở tour detail | Tour được archive/soft delete | Không xoá cứng ngay khỏi database |
| 20 | Dashboard latest tour | USER | Vào app là thấy lịch trình gần nhất | Login vào `/dashboard` | Dashboard hiển thị latest saved tour và mini map | Dashboard là màn hình chính sau login |

### 2.5 Favorite, Review Và Background Music

| STT | Feature | Người sử dụng | Mục đích | Cách sử dụng | Kết quả mong đợi | Điểm nổi bật khi review |
| --- | --- | --- | --- | --- | --- | --- |
| 21 | Favorite nhà hàng | USER | Lưu quán muốn xem lại | Bấm favorite ở detail | Quán xuất hiện tại `/favorites` | Dữ liệu favorite theo từng user |
| 22 | Viết/sửa/xoá review | USER | Ghi đánh giá cá nhân | Tại detail nhà hàng, submit review | Review được lưu, rating nhà hàng tính lại | Có validate và tính rating ở server |
| 23 | Chỉ hiện review published | Tất cả người dùng | Tránh lộ review bị ẩn/flag | Xem detail nhà hàng | Chỉ review hợp lệ hiển thị công khai | Có kiểm duyệt nội dung |
| 24 | Nhạc nền toàn app | Tất cả người dùng | Tạo không khí nhẹ nhàng khi dùng app | Dùng music box cố định góc dưới trái | Bật/tắt nhạc, chỉnh volume, tự chuyển bài | Một audio player duy nhất chạy xuyên suốt app |

### 2.6 Admin Và Moderation

| STT | Feature | Người sử dụng | Mục đích | Cách sử dụng | Kết quả mong đợi | Điểm nổi bật khi review |
| --- | --- | --- | --- | --- | --- | --- |
| 25 | Admin dashboard | ADMIN | Xem thống kê nhanh | Login admin, vào `/admin` | Thấy số user, nhà hàng, review, tour | Có góc nhìn quản trị dữ liệu |
| 26 | Quản lý nhà hàng | ADMIN | Thêm/sửa/ẩn/khôi phục nhà hàng demo | Tab Restaurants trong admin | Nhà hàng cập nhật trong database | Có tạo slug, tag, opening hours, menu mặc định |
| 27 | Quản lý user | ADMIN | Khoá/mở khoá user, đổi role | Tab Users trong admin | User bị lock hoặc đổi role | Có chặn tự lock hoặc tự hạ quyền admin hiện tại |
| 28 | Kiểm duyệt review | ADMIN, MODERATOR | Publish/hide/flag review | Tab Reviews hoặc workspace Moderation | Review đổi trạng thái, rating nhà hàng tính lại | Có bảng `ModerationAction` lưu dấu vết kiểm duyệt |
| 29 | Back to Dashboard | ADMIN, MODERATOR | Thoát khỏi khu quản trị rõ ràng | Bấm Back to Dashboard | Quay lại dashboard | Giảm nhầm lẫn khi demo |

### 2.7 Độ Sẵn Sàng Và Kiểm Tra

| STT | Feature | Người sử dụng | Mục đích | Cách sử dụng | Kết quả mong đợi | Điểm nổi bật khi review |
| --- | --- | --- | --- | --- | --- | --- |
| 30 | Health check | Người demo/kỹ thuật | Kiểm tra backend và database | Mở `/api/health` | Trả `ok: true`, database reachable | Dễ chứng minh backend hoạt động |
| 31 | Loading/error/404 | Tất cả người dùng | Tránh màn hình trắng | Truy cập trang đang load/lỗi/không tồn tại | Có UI loading, retry, not found | App có xử lý trạng thái cơ bản |
| 32 | Preflight script | Người demo/kỹ thuật | Kiểm tra env, DB và seed data | Chạy `npm.cmd run preflight` | Báo PASS/WARN/FAIL | Hữu ích trước khi review hoặc deploy |

## 3. Onboarding Cho Thành Viên Mới

### 3.1 Cần Hiểu Trước

- [ ] FoodTour App là app lập lịch trình ăn uống khi đi du lịch Việt Nam.
- [ ] Dữ liệu nhà hàng hiện tại là demo hư cấu.
- [ ] Dashboard là màn hình chính sau khi login.
- [ ] Tour generator là feature cốt lõi nhất.
- [ ] Map giúp chứng minh dữ liệu có vị trí thật trên bản đồ.
- [ ] Admin/moderator chứng minh hệ thống có phân quyền.

### 3.2 Tài Khoản Demo

| Role | Email | Password | Dùng để demo |
| --- | --- | --- | --- |
| User | `user@foodtour.demo` | `FoodTour@123` | Tạo tour, favorite, review, chỉnh tour |
| Moderator | `moderator@foodtour.demo` | `FoodTour@123` | Kiểm duyệt review |
| Admin | `admin@foodtour.demo` | `FoodTour@123` | Quản lý nhà hàng, user, review |

### 3.3 Cách Chạy Local

1. Cài thư viện:

   ```powershell
   npm.cmd install
   ```

   Tác dụng: tải các package cần để chạy app.

2. Tạo file môi trường:

   ```powershell
   Copy-Item .env.example .env
   ```

   Tác dụng: tạo file cấu hình database, auth, URL local.

3. Chạy PostgreSQL bằng Docker:

   ```powershell
   docker compose up -d
   ```

   Tác dụng: bật database local.

4. Tạo Prisma Client:

   ```powershell
   npm.cmd run prisma:generate
   ```

   Tác dụng: giúp code TypeScript nói chuyện với database.

5. Đẩy schema vào database:

   ```powershell
   npm.cmd run db:push
   ```

   Tác dụng: tạo bảng theo `prisma/schema.prisma`.

6. Seed dữ liệu demo:

   ```powershell
   npm.cmd run db:seed
   ```

   Tác dụng: tạo city, restaurant, user, review, tour demo.

7. Chạy app:

   ```powershell
   npm.cmd run dev
   ```

   Mở: `http://localhost:3000`

### 3.4 Cách Kiểm Tra Feature Hoạt Động

| Feature | Cách kiểm tra nhanh | Kết quả đúng |
| --- | --- | --- |
| Login | Login bằng `user@foodtour.demo` | Vào dashboard |
| Restaurant filter | Vào `/restaurants`, chọn `Hue` | Danh sách chỉ còn quán ở Hue |
| Pagination | Vào `/restaurants`, bấm Next | Chuyển sang trang tiếp theo |
| Detail | Bấm một nhà hàng | Có menu, review, opening hours |
| Map | Vào `/map`, chọn city | Marker/list đổi theo city |
| Generate tour | Vào `/tour-generator`, tạo tour | Có kết quả và nút View tour |
| Edit tour | Vào detail tour, bấm Edit plan | Sửa được stop và lưu lại |
| Favorite | Favorite một nhà hàng | Quán hiện trong `/favorites` |
| Review | Viết review | Review lưu lại hoặc cập nhật |
| Admin | Login admin, vào `/admin` | Thấy các tab quản trị |
| Moderator | Login moderator, vào `/admin` | Chỉ thấy workspace Reviews |
| Health | Mở `/api/health` | Database reachable |

## 4. User Flow Chính

### 4.1 Flow Người Dùng Mới

`Trang chủ → Register/Login → Dashboard → Explore restaurants → Restaurant detail → Favorite hoặc Review`

| Nội dung | Chi tiết |
| --- | --- |
| Mục tiêu | Cho thấy người dùng mới hiểu app và bắt đầu khám phá nhanh. |
| Dữ liệu cần chuẩn bị | Demo account user hoặc tạo account mới. |
| Kết quả cần xuất hiện | Dashboard, danh sách nhà hàng, chi tiết nhà hàng. |
| Thông điệp nói với giảng viên | App không chỉ có landing page; sau login là trải nghiệm sản phẩm chính. |

### 4.2 Flow Cốt Lõi Tạo Food Tour

`Login user → Tour generator → Chọn city/budget/sở thích → Generate and save → View tour → Edit plan → Save edited plan`

| Nội dung | Chi tiết |
| --- | --- |
| Mục tiêu | Chứng minh giá trị chính: tự động gợi ý tour nhưng user vẫn chỉnh được. |
| Dữ liệu cần chuẩn bị | Chọn Hue, Da Nang hoặc Hoi An; budget khoảng `600000`; 2 người; motorbike. |
| Kết quả cần xuất hiện | Tour có timeline, tổng chi phí, khoảng cách, thời gian, lý do chọn stop. |
| Thông điệp nói với giảng viên | Gợi ý ban đầu giúp tiết kiệm thời gian, editor giúp người dùng kiểm soát lịch trình. |

### 4.3 Flow Map

`Map → Filter city → Click marker/list → Show route line → My Location`

| Nội dung | Chi tiết |
| --- | --- |
| Mục tiêu | Chứng minh app có dữ liệu vị trí và trải nghiệm khám phá theo bản đồ. |
| Dữ liệu cần chuẩn bị | Browser cho phép location nếu muốn demo My Location. |
| Kết quả cần xuất hiện | Marker nhà hàng, popup, list đồng bộ, route preview line. |
| Thông điệp nói với giảng viên | Map hỗ trợ quyết định tuyến đi; đường xanh là preview ước lượng, app ghi rõ để tránh hiểu nhầm. |

### 4.4 Flow Admin

`Login admin → Admin Panel → Xem stats → Hide/restore restaurant → Lock/unlock user → Moderate review → Back to Dashboard`

| Nội dung | Chi tiết |
| --- | --- |
| Mục tiêu | Chứng minh hệ thống có phân quyền và quản trị dữ liệu. |
| Dữ liệu cần chuẩn bị | `admin@foodtour.demo`. |
| Kết quả cần xuất hiện | Tab Overview, Restaurants, Users, Reviews. |
| Thông điệp nói với giảng viên | Đây là full-stack app có luồng vận hành, không chỉ là giao diện cho khách hàng. |

### 4.5 Flow Moderator

`Login moderator → Moderation → Reviews → Publish/Hide/Flag review`

| Nội dung | Chi tiết |
| --- | --- |
| Mục tiêu | Giải thích role trung gian không giống user thường. |
| Dữ liệu cần chuẩn bị | `moderator@foodtour.demo`. |
| Kết quả cần xuất hiện | Workspace review, không có quyền quản lý user/restaurant. |
| Thông điệp nói với giảng viên | Moderator chỉ tập trung kiểm duyệt nội dung, giảm rủi ro cấp quyền quá rộng. |

## 5. Flow Review 7-10 Phút

| Thời gian | Người trình bày | Thao tác trên màn hình | Nội dung cần nói | Điểm muốn giảng viên ghi nhận |
| --- | --- | --- | --- | --- |
| 0:00-0:45 | Người mở đầu | Mở trang chủ hoặc dashboard | Giới thiệu vấn đề: du khách khó chọn quán, khó sắp tuyến, khó kiểm soát chi phí | Bài toán thực tế, dễ hiểu |
| 0:45-1:20 | Người nghiệp vụ | Mở `/restaurants` | FoodTour gom dữ liệu nhà hàng ở nhiều thành phố du lịch Việt Nam | Không chỉ một thành phố; có 10 city demo |
| 1:20-2:10 | Người demo | Search/filter nhà hàng, chuyển page | Lọc theo city, type, price, rating để thu hẹp lựa chọn | Dữ liệu nhiều, có phân trang và filter |
| 2:10-3:00 | Người demo | Mở restaurant detail | Xem menu, ảnh, giá, giờ mở cửa, review, favorite | Quyết định dựa trên thông tin đầy đủ |
| 3:00-4:00 | Người demo | Mở `/map`, filter city, click marker | Map giúp xem vị trí quán và danh sách đồng bộ | Có bản đồ thật OpenStreetMap |
| 4:00-5:30 | Người demo | Login user, mở `/tour-generator`, generate tour | Người dùng nhập ngân sách, số người, sở thích, phương tiện | Engine rule-based xử lý yêu cầu thực tế |
| 5:30-6:40 | Người demo | Mở tour detail, bấm Edit plan | User có thể sửa lịch trình: đổi quán, giờ, thứ tự, chi phí, thêm/xoá stop | App không bắt user phụ thuộc hoàn toàn vào gợi ý |
| 6:40-7:30 | Người demo | Mở `/tours`, `/favorites`, review form | Tour/favorite/review được lưu theo user | Có dữ liệu cá nhân và lịch sử |
| 7:30-8:40 | Người kỹ thuật | Login admin hoặc moderator, mở `/admin` | Admin quản lý dữ liệu; moderator kiểm duyệt review | Có phân quyền rõ ràng |
| 8:40-9:30 | Người kỹ thuật | Nói ngắn về backend/database | Next.js làm frontend + API, PostgreSQL lưu dữ liệu, Prisma quản lý schema | Full-stack hoàn chỉnh |
| 9:30-10:00 | Người kết luận | Quay dashboard/latest tour | Kết luận giá trị và hướng mở rộng | Sản phẩm demo mạch lạc, có tiềm năng mở rộng |

## 6. Kịch Bản Lời Nói

### 6.1 Mở Đầu

> Nhóm em xây dựng FoodTour App, một ứng dụng giúp người đi du lịch ở Việt Nam lên lịch trình ăn uống theo thành phố, ngân sách, thời gian và sở thích cá nhân.

### 6.2 Giới Thiệu Vấn Đề

> Khi đi du lịch, người dùng thường phải tự tìm quán, so sánh giá, xem vị trí và tự ghép thành lịch trình. Việc này mất thời gian, nhất là khi đi theo nhóm hoặc chỉ có một ngày ở thành phố đó.

### 6.3 Giới Thiệu Giải Pháp

> FoodTour App giải quyết bằng cách gom ba phần vào một sản phẩm: khám phá nhà hàng, xem bản đồ và tạo lịch trình food tour có thể lưu lại.

### 6.4 Chuyển Sang Danh Sách Nhà Hàng

> Trước tiên, người dùng có thể khám phá dữ liệu nhà hàng demo ở các thành phố du lịch trọng điểm như Hà Nội, Đà Nẵng, Hội An, Huế, Đà Lạt, Cần Thơ và Phú Quốc.

### 6.5 Chuyển Sang Map

> Sau khi có danh sách, map giúp người dùng hiểu các quán nằm ở đâu, khoảng cách tương đối như thế nào và có thể chọn quán theo khu vực.

### 6.6 Chuyển Sang Tour Generator

> Đây là phần chính của dự án. Người dùng nhập ngân sách, số người, thời gian, phương tiện và khẩu vị. Hệ thống sẽ chọn các stop phù hợp dựa trên rule và điểm số, không phải chọn ngẫu nhiên.

### 6.7 Giải Thích Edit Plan

> Điểm quan trọng là lịch trình sau khi tạo vẫn chỉnh được. Người dùng có thể đổi quán, đổi giờ, thêm hoặc xoá stop. Vì vậy hệ thống hỗ trợ ra quyết định, nhưng quyền kiểm soát cuối cùng vẫn thuộc về người dùng.

### 6.8 Chuyển Sang Admin/Moderator

> Ngoài luồng người dùng, app còn có phần quản trị. Admin quản lý dữ liệu demo và user, còn moderator tập trung kiểm duyệt review để đảm bảo nội dung công khai hợp lệ.

### 6.9 Kết Luận

> Tóm lại, FoodTour App là một MVP full-stack có dữ liệu, xác thực, phân quyền, bản đồ, lưu lịch trình và quản trị. Đây là nền tảng có thể mở rộng thêm dữ liệu thật, audio thật hoặc tích hợp routing nâng cao trong tương lai.

## 7. Phân Chia Vai Trò Trong Nhóm

| Vai trò | Cần chuẩn bị gì | Cần hiểu phần nào | Khi nào bắt đầu nói | Khi nào chuyển tiếp |
| --- | --- | --- | --- | --- |
| Người mở đầu | Vấn đề, đối tượng user, giá trị app | Tổng quan dự án | 0:00 | Sau khi nêu bài toán và giải pháp |
| Người điều khiển demo | Link app, tài khoản demo, flow thao tác | Các trang `/restaurants`, `/map`, `/tour-generator`, `/tours` | Khi bắt đầu demo màn hình | Chuyển khi cần giải thích nghiệp vụ hoặc kỹ thuật |
| Người trình bày nghiệp vụ | Use case du lịch, cách chọn quán, cách tạo tour | Giá trị của filter, map, generator, edit plan | Khi demo feature chính | Sau khi hoàn tất user flow |
| Người giải thích kỹ thuật | Kiến trúc, database, API, role | Next.js, Prisma, PostgreSQL ở mức dễ hiểu | Sau phần demo user | Chuyển sang admin/moderator hoặc Q&A |
| Người xử lý câu hỏi | Bảng Q&A, hạn chế, hướng cải thiện | Toàn bộ feature và giới hạn thật | Khi giảng viên hỏi | Kết thúc bằng câu trả lời ngắn, có bằng chứng |

**Nếu nhóm chỉ có một người code:** vẫn chia vai trò trình bày theo nội dung. Người code nên phụ trách phần demo và câu hỏi kỹ thuật; các thành viên khác phụ trách mở đầu, nghiệp vụ, kết luận và Q&A theo script.

## 8. Điểm Mạnh Nên Nhấn Mạnh

| Điểm mạnh | Bằng chứng trong dự án | Cách nói khi review |
| --- | --- | --- |
| Giải quyết nhu cầu thực tế | Flow tìm quán → map → generate tour → edit/save tour | “App hỗ trợ một hành trình ra quyết định hoàn chỉnh.” |
| Full-stack hoàn chỉnh | Có pages, API route handlers, Prisma schema, PostgreSQL | “Dữ liệu không hard-code ở UI, app đọc/ghi database.” |
| Có phân quyền | Role USER, MODERATOR, ADMIN; guard page/API | “Mỗi role có quyền khác nhau.” |
| Gợi ý tour có logic | Recommendation engine lọc allergy, vegetarian, budget, giờ mở cửa, distance | “Engine rule-based, có tiêu chí rõ ràng và dễ giải thích.” |
| User vẫn chỉnh được tour | `TourPlanEditor`, `PATCH /api/food-tours/:id` | “Gợi ý không thay thế quyết định của người dùng.” |
| Có bản đồ thật | Leaflet + OpenStreetMap + geolocation | “Người dùng thấy vị trí trực quan.” |
| Dữ liệu demo phong phú | Seed 10 city, 60 restaurant, 300 review, 40 tour | “Đủ dữ liệu để demo nhiều tình huống.” |
| Có kiểm tra dữ liệu đầu vào | Zod schemas cho auth, restaurant query, tour, review, admin | “Input được validate trước khi xử lý.” |
| Có xử lý lỗi | Error UI, loading UI, API error responses, network error trong client | “Không để người dùng gặp màn hình trắng.” |
| Có khả năng mở rộng | Background music từ folder `music`, optional external routing key, asset resolver | “MVP đã có chỗ nối cho dữ liệu/audio/routing thật sau này.” |

## 9. Câu Hỏi Giảng Viên Có Thể Hỏi

| Câu hỏi có thể được hỏi | Người nên trả lời | Câu trả lời ngắn gọn | Bằng chứng trong dự án |
| --- | --- | --- | --- |
| Vì sao chọn đề tài này? | Người mở đầu | Vì du lịch ẩm thực là nhu cầu thực tế, người dùng cần tìm quán và sắp lịch trình nhanh. | Flow restaurant → map → tour |
| Người dùng mục tiêu là ai? | Người nghiệp vụ | Du khách hoặc nhóm bạn muốn khám phá ẩm thực ở các thành phố Việt Nam. | Seed 10 thành phố du lịch |
| Feature quan trọng nhất là gì? | Người nghiệp vụ | Tạo food tour theo ngân sách, thời gian, sở thích và có thể chỉnh lại thủ công. | `/tour-generator`, `/tours/:id` |
| Dữ liệu được lưu ở đâu? | Người kỹ thuật | PostgreSQL; Prisma định nghĩa bảng và quan hệ dữ liệu. | `prisma/schema.prisma` |
| Frontend gọi backend thế nào? | Người kỹ thuật | Giao diện gọi các API route như `/api/restaurants`, `/api/food-tours`, `/api/admin/reviews`. | `src/app/api/*` |
| Vì sao chọn Next.js? | Người kỹ thuật | Vì Next.js làm được cả giao diện và API trong một project, phù hợp deadline ngắn và một người code full-stack. | README, cấu trúc `src/app` |
| App có dùng AI/LLM chưa? | Người kỹ thuật | Chưa tích hợp LLM. Phần gợi ý hiện là rule-based recommendation engine để demo ổn định. | `src/services/recommendations` |
| Phân quyền hoạt động thế nào? | Người kỹ thuật | User dùng app chính; moderator kiểm duyệt review; admin quản lý dữ liệu và user. | `UserRole`, `requireRole`, `requireApiRole` |
| Moderator khác user thường ở đâu? | Người kỹ thuật | Moderator có vào workspace kiểm duyệt review; user thường không vào được API admin. | `/admin`, `/api/admin/reviews` |
| Làm sao chứng minh backend thật? | Người kỹ thuật | Mở `/api/health`, tạo tour/review/favorite rồi refresh thấy dữ liệu vẫn còn. | API + PostgreSQL |
| Nếu có thêm thời gian sẽ làm gì? | Người Q&A | Thêm dữ liệu thật, thêm nhiều bài nhạc hợp pháp hơn, routing provider thật, LLM hỗ trợ mô tả tour, upload ảnh review. | Background music folder, optional routing key |
| Hạn chế hiện tại là gì? | Người Q&A | Dữ liệu là demo hư cấu, audio là placeholder, route là ước lượng MVP. Sẽ thay bằng dữ liệu và provider thật khi mở rộng. | README, docs, map note |
| Ai phụ trách phần nào? | Nhóm trưởng | Một thành viên code full-stack; các thành viên còn lại phụ trách nghiệp vụ, demo script, kiểm thử và trình bày. | Kế hoạch nhóm |
| Làm sao biết review bị kiểm duyệt không hiện công khai? | Người demo | Moderator/admin đổi review sang hidden/flagged; trang detail chỉ lấy review published. | Review status và public review query |

## 10. Checklist Trước Khi Review

### 10.1 Kỹ Thuật

- [ ] Docker/PostgreSQL đã chạy nếu demo local.
- [ ] `.env` có `DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`.
- [ ] Đã chạy `npm.cmd run db:push`.
- [ ] Đã chạy `npm.cmd run db:seed`.
- [ ] `npm.cmd run preflight` không có lỗi nghiêm trọng.
- [ ] `npm.cmd run lint` pass.
- [ ] `npm.cmd run typecheck` pass.
- [ ] `npm.cmd run test` pass.
- [ ] `npm.cmd run build` pass nếu chuẩn bị deploy.
- [ ] `/api/health` trả database reachable.

### 10.2 Demo

- [ ] Login được `user@foodtour.demo`.
- [ ] Login được `moderator@foodtour.demo`.
- [ ] Login được `admin@foodtour.demo`.
- [ ] `/restaurants` có dữ liệu và pagination.
- [ ] Filter restaurant hoạt động.
- [ ] Restaurant detail có ảnh, menu, review, favorite.
- [ ] `/map` hiện marker và OpenStreetMap tile.
- [ ] My Location hoạt động hoặc có sẵn câu giải thích nếu browser chặn quyền.
- [ ] Generate tour thành công với một city demo.
- [ ] Tour detail có timeline và edit plan.
- [ ] `/favorites` có thể hiển thị quán đã favorite.
- [ ] `/admin` admin vào được.
- [ ] `/admin` moderator vào được workspace review.
- [ ] User thường không vào được API admin.
- [ ] Không có trang trắng hoặc link gãy trong flow chính.
- [ ] Có ảnh/video dự phòng nếu internet hoặc Vercel chậm.
- [ ] Các thành viên đã tập chuyển phần theo script.

## 11. Lưu Ý Trước Khi Demo

| Lưu ý | Cách xử lý |
| --- | --- |
| Dữ liệu nhà hàng là demo hư cấu | Nói rõ “fictitious demo data” khi trình bày. |
| Nhạc nền lấy từ folder `music` | Chỉ dùng các file thật có sẵn; muốn thêm bài thì thêm file audio thật vào folder này. |
| Route line trên map là preview ước lượng | Nói rõ line xanh nối các điểm lọc đầu tiên, không phải navigation thật. |
| My Location phụ thuộc quyền browser | Nếu browser hỏi quyền, bấm Allow; nếu không được, nói đây là quyền thiết bị. |
| App có thể vẫn logged in sau deploy | Do cookie session còn trong browser; logout hoặc dùng incognito để demo login từ đầu. |
| Không nói gợi ý tour dùng LLM | Nói đúng là rule-based engine có scoring. |
| Nếu hỏi hạn chế | Trả lời theo công thức: giới hạn hiện tại → lý do MVP/deadline → hướng cải thiện cụ thể. |

## 12. Review Nhanh Trong 3 Phút

| Thời gian | Thao tác | Lời nói chính |
| --- | --- | --- |
| 0:00-0:30 | Mở trang chủ/dashboard | “FoodTour giúp du khách lập lịch trình ăn uống theo thành phố, ngân sách và sở thích.” |
| 0:30-1:00 | Mở `/restaurants`, filter city | “App có dữ liệu demo nhiều thành phố du lịch Việt Nam, có search/filter và phân trang.” |
| 1:00-1:30 | Mở restaurant detail | “Người dùng xem menu, giá, giờ mở cửa, review và có thể favorite.” |
| 1:30-2:10 | Mở `/tour-generator`, generate hoặc mở tour có sẵn | “Feature chính là tạo food tour bằng rule-based engine, có cost/time/distance và lý do chọn stop.” |
| 2:10-2:35 | Mở tour detail, bấm Edit plan | “Sau khi được gợi ý, user vẫn có thể chỉnh lịch trình thủ công.” |
| 2:35-3:00 | Mở `/admin` bằng admin/moderator | “Hệ thống có phân quyền: admin quản lý dữ liệu, moderator kiểm duyệt review.” |

### Câu Kết 3 Phút

> Tóm lại, dự án không chỉ là giao diện demo mà là một app full-stack có database, API, phân quyền, map, recommendation engine và luồng người dùng hoàn chỉnh từ khám phá quán đến lưu lịch trình.
