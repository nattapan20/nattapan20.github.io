
const RB = ReactBootstrap;
const { Alert, Card, Button, table } = ReactBootstrap;

class App extends React.Component {
    title = (
        <Alert variant="info">
            <b>Work6 :</b> Firebase
        </Alert>
    );
    footer = (
        <div>
            By xxxxxxxxxx-x xxxxxxxxxxxxx xxxxxxxxxxxxxx <br />
            College of Computing, Khon Kaen University
        </div>
    );

    constructor(props) {
        super(props);
        this.state = {
            scene: 0, // เริ่มที่หน้า Login
            user: null,
            students: [],
            stdid: "",
            stdtitle: "",
            stdfname: "",
            stdlname: "",
            stdemail: "",
            stdphone: "",
            loading: true, // เพิ่ม state สำหรับโหลดข้อมูล
        };
    }

    
    componentDidMount() {
        localStorage.clear(); // ล้างค่าที่ Firebase จำไว้
        sessionStorage.clear(); // ล้าง session
    
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                this.setState({ user: user.toJSON(), scene: 1 });
            } else {
                this.setState({ user: null, scene: 0 });
            }
        });
    }
    

    google_login() {
    var provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope("profile");
    provider.addScope("email");

    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION) // ไม่ให้เก็บค่า login ถ้าปิดเบราว์เซอร์
        .then(() => {
            return firebase.auth().signInWithPopup(provider);
        })
        .then((result) => {
            this.setState({ user: result.user.toJSON(), scene: 1 });
        })
        .catch((error) => {
            console.error("Login error:", error);
        });
}

    google_logout() {
        if (confirm("Are you sure?")) {
            firebase.auth().signOut().then(() => {
                this.setState({ user: null, scene: 0 });
            });
        }
    }

    render() {
        console.log("Current scene:", this.state.scene); // Debugging

        if (this.state.loading) {
            return <div>กำลังโหลด...</div>;
        }

        if (this.state.scene === 0) {
            return (
                <Card>
                    <Card.Header>เข้าสู่ระบบ</Card.Header>
                    <LoginBox user={this.state.user} app={this} />
                    <Card.Footer>College of Computing, KKU</Card.Footer>
                </Card>
            );
        } else {
            return (
                <Card>
                    <Card.Header>
                        <div style={{ padding: "10px", background: "#f0f0f0", borderRadius: "5px", marginBottom: "10px" }}>
                            <b>🔹 ผู้ใช้ที่ล็อกอิน:</b><br />
                            <img src={this.state.user?.photoURL} alt="User profile" style={{ width: "40px", borderRadius: "50%" }} />
                            <span style={{ marginLeft: "10px" }}>{this.state.user?.displayName} ({this.state.user?.email})</span>
                        </div>
                    </Card.Header>
                    <Card.Header>ระบบจัดการนักศึกษา</Card.Header>
                    
                    <Card.Body>
                        <Button onClick={() => this.readData()}>Read Data</Button>
                        <Button onClick={() => this.autoRead()}>Auto Read</Button>
                        <div>
                            <StudentTable data={this.state.students} app={this} />
                        </div>
                    </Card.Body>
                    <Card.Footer>
                        <b>เพิ่ม/แก้ไขข้อมูลนักศึกษา :</b><br />
                        <TextInput label="ID" app={this} value="stdid" style={{ width: 120 }} />
                        <TextInput label="คำนำหน้า" app={this} value="stdtitle" style={{ width: 100 }} />
                        <TextInput label="ชื่อ" app={this} value="stdfname" style={{ width: 120 }} />
                        <TextInput label="สกุล" app={this} value="stdlname" style={{ width: 120 }} />
                        <TextInput label="Email" app={this} value="stdemail" style={{ width: 150 }} />
                        <TextInput label="Phone" app={this} value="stdphone" style={{ width: 120 }} />
                        <Button onClick={() => this.insertData()}>Save</Button>
                    </Card.Footer>
                    <Card.Footer>By xxxxxxxxxx-x xxxxxxxxxxxxx xxxxxxxxxxxxxx <br />
                    College of Computing, Khon Kaen University
                    </Card.Footer>
                    <Card.Footer>
                        {/* ปุ่ม Logout ที่เพิ่มเข้ามา */}
                        <Button onClick={() => this.google_logout()} >Logout</Button>
                    </Card.Footer>
                </Card>
            );
        }
    }


    readData() {
        db.collection("students").get().then((querySnapshot) => {
            var stdlist = [];
            querySnapshot.forEach((doc) => {
                stdlist.push({ id: doc.id, ...doc.data() });
            });
            console.log(stdlist);
            this.setState({ students: stdlist });
        });
    }

    autoRead() {
        db.collection("students").onSnapshot((querySnapshot) => {
            var stdlist = [];
            querySnapshot.forEach((doc) => {
                stdlist.push({ id: doc.id, ...doc.data() });
            });
            this.setState({ students: stdlist });
        });
    }

    insertData() {
        db.collection("students").doc(this.state.stdid).set({
            title: this.state.stdtitle,
            fname: this.state.stdfname,
            lname: this.state.stdlname,
            phone: this.state.stdphone,
            email: this.state.stdemail,
        });
    }

    edit(std) {
        this.setState({
            stdid: std.id,
            stdtitle: std.title,
            stdfname: std.fname,
            stdlname: std.lname,
            stdemail: std.email,
            stdphone: std.phone,
        })
    }

    delete(std) {
        if (confirm("ต้องการลบข้อมูล")) {
            db.collection("students").doc(std.id).delete();
        }
    }

}

function LoginBox(props) {
    const u = props.user;
    const app = props.app;

    if (!u) {
        return (
            <div>
                <Button onClick={() => app.google_login()}>Login</Button>
            </div>
        );
    } else {
        return (
            <div>
                <img src={u.photoURL} alt="User profile" />
                {u.email}
                <Button onClick={() => app.google_logout()}>Logout</Button>
            </div>
        );
    }
}





const container = document.getElementById("myapp");
const root = ReactDOM.createRoot(container);
root.render(<App />);

const firebaseConfig = {
    apiKey: "AIzaSyB08ab5RvHssfLmBH9EJU0u9n0P9U7Fx7M",
    authDomain: "webmoblie2567-2.firebaseapp.com",
    projectId: "webmoblie2567-2",
    storageBucket: "webmoblie2567-2.firebasestorage.app",
    messagingSenderId: "264384018",
    appId: "1:264384018:web:123bb14e1d8dbd9123f2cb",
    measurementId: "G-SWRF0MGK6Q"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
db.collection("students").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        console.log(`${doc.id} =>`, doc.data());
    });
});



function StudentTable({ data, app }) {
    return <table className='table'>
        <tr>
            <td>รหัส</td>
            <td>คำนำหน้า</td>
            <td>ชื่อ</td>
            <td>สกุล</td>
            <td>email</td>
        </tr>
        {
            data.map((s) => <tr>
                <td>{s.id}</td>
                <td>{s.title}</td>
                <td>{s.fname}</td>
                <td>{s.lname}</td>
                <td>{s.email}</td>
                <td><EditButton std={s} app={app} /></td>
                <td><DeleteButton std={s} app={app} /></td>
            </tr>)
        }
    </table>

}

function TextInput({ label, app, value, style }) {
    return <label className="form-label">
        {label}:
        <input className="form-control" style={style}
            value={app.state[value]} onChange={(ev) => {
                var s = {};
                s[value] = ev.target.value;
                app.setState(s)
            }
            }></input>
    </label>;
}

function EditButton({ std, app }) {
    return <button onClick={() => app.edit(std)}>แก้ไข</button>
}

function DeleteButton({ std, app }) {
    return <button onClick={() => app.delete(std)}>ลบ</button>
}





