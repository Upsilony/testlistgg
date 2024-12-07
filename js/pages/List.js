import { store } from "../main.js";
import { embed, getFontColour } from "../util.js";
import { score } from "../score.js";
import { fetchEditors, fetchList } from "../content.js";

import Spinner from "../components/Spinner.js";
import LevelAuthors from "../components/List/LevelAuthors.js";

const roleIconMap = {
    owner: "crown",
    admin: "user-gear",
    helper: "user-shield",
    dev: "code",
    trial: "user-lock",
};

export default {
    components: { Spinner, LevelAuthors },
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-list">
            <div class="list-container">
                <table class="list" v-if="list">
                    <tr v-for="([level, err], i) in list">
                        <td class="rank">
                            <p v-if="i + 1 <= 150" class="type-label-lg">#{{ i + 1 }}</p>
                            <p v-else class="type-label-lg">Legacy</p>
                        </td>
                        <td class="level" :class="{ 'active': selected == i, 'error': !level }">
                            <button @click="selected = i">
                                <span class="type-label-lg">{{ level?.name || \`Error (\${err}.json)\` }}</span>
                            </button>
                        </td>
                    </tr>
                </table>
            </div>
            <div class="level-container">
                <div class="level" v-if="level">
                    <h1>{{ level.name }}</h1>
                    <LevelAuthors :author="level.author" :creators="level.creators" :verifier="level.verifier"></LevelAuthors>
                    <div v-if="level.showcase" class="tabs">
                        <button class="btn" :class="{selected: !toggledShowcase}" @click="toggledShowcase = false">
                            <span class="type-label-lg">Verification</span>
                        </button>
                        <button class="btn" :class="{selected: toggledShowcase}" @click="toggledShowcase = true">
                            <span class="type-label-lg">Showcase</span>
                        </button>
                    </div>
                    <iframe class="video" id="videoframe" :src="video" frameborder="0"></iframe>
                    <ul class="stats">
                        <li>
                            <div class="type-title-sm">Poin</div>
                            <p v-if="selected + 1 <= 75">{{ score(selected + 1, level.percentToQualify, level.percentToQualify) }} (100% = {{ score(selected + 1, 100, level.percentToQualify) }})</p>
                        </li>
                        <li>
                            <div class="type-title-sm">ID</div>
                            <p>{{ level.id }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">Kata sandi</div>
                            <p>{{ level.password || 'Gratis copy' }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">Demon difficulty</div>
                            <p>{{ level.difficulty || 'Demon' }}</p>
                        </li>
                    </ul>
                    <h2>Rekor</h2>
                    <p class="extended"><b>{{ level.records.length }}</b> rekor terdaftar</p>
                    <p v-if="selected + 1 <= 75"><strong>{{ level.percentToQualify }}%</strong> or better to qualify</p>
                    <p v-else-if="selected +1 <= 150"><strong>100%</strong> or better to qualify</p>
                    <p v-else>This level does not accept new records.</p>
                    <table class="records">
                        <tr v-for="record in level.records" class="record">
                            <td class="percent">
                                <p v-if="record.percent == 100"><b>{{ record.percent }}%</b></p>
                                <p v-else>{{ record.percent }}%</p>
                            </td>
                            <td class="user">
                                <a :href="record.link" target="_blank" class="type-label-lg">{{ record.user }}</a>
                            </td>
                            <td class="legacy">
                                <img v-if="record.legacy" :src="\`/assets/legacy.svg\`" alt="Legacy" title="Legacy Record">
                            </td>
                                <a :href="record.link" target="_blank" class="type-label-lg">{{ record.user }}</a>
                            </td>
                            <td class="mobile">
                                <img v-if="record.mobile" :src="\`/assets/phone-landscape\${store.dark ? '-dark' : ''}.svg\`" alt="Mobile">
                            </td>
                            <td class="hz">
                                <p>{{ record.hz }}Hz</p>
                            </td>
                        </tr>
                    </table>
                </div>
                <div v-else class="level" style="height: 100%; justify-content: center; align-items: center;">
                    <p>(ノಠ益ಠ)ノ彡┻━┻</p>
                </div>
            </div>
            <div class="meta-container">
                <div class="meta">
                    <div class="errors" v-show="errors.length > 0">
                        <p class="error" v-for="error of errors">{{ error }}</p>
                    </div>
                    <div class="dark-bg">
                    <h2>Changelog:</h2>
                    <br>
                    <p class="extended">...</p>
                    <br><br>
                    <p>Belum ada catatan perubahan</p>
                    </div>
                    <div class="dark-bg">
                    <h2>Peraturan</h2>
                    <br>
                    <p>Setiap tindakan dilakukan sesuai dengan aturan kami. Untuk menjamin pengalaman yang konsisten, pastikan untuk memverifikasinya sebelum mengirim rekor!</p>
                    <br><br>
                    <a class="btngl" href="/extended-page/rules.html">Halaman aturan</a>
                    <a class"btngl" href="/extended-page/faq.html">Penempatan list</a>
                    </div>
                    <div class="dark-bg" v-if="editors">
                        <h3>List Staff:</h3>
                        <br>
                        <ol class="editors">
                            <li v-for="editor in editors">
                                <img :src="\`/assets/\${roleIconMap[editor.role]}\${store.dark ? '-dark' : ''}.svg\`" :alt="editor.role">
                                <a v-if="editor.link" class="type-label-lg link" target="_blank" :href="editor.link">{{ editor.name }}</a>
                                <p v-else>{{ editor.name }}</p>
                            </li>
                        </ol>
                    </div>
                    </template>
                    <div class="og">
                        <iframe class="discord-box" src="https://discord.com/widget?id=1303563415066902619&theme=dark" width="270" height="300" allowtransparency="false" frameborder="0" sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"></iframe>
                    </div>
                    <div class="og" class="dark-bg">
                        <p>Semua kredit pergi ke <a href="https://tsl.pages.dev/#/" target="_blank">TSL</a> untuk website dan <a href="https://tgdps-dl.pages.dev/#/" target="_blank">TGDPS Demonlist</a> untuk inspirasi layout, yang situs webnya merupakan replika dari ini. Ini tidak ada koneksi/afiliasi dengan TSL. List Original oleh <a href="https://me.redlimerl.com/" target="_blank">RedLime</a></p>
                    </div>
                    <button class="btngl" @click="selected = 0">#1 Demon</button>
                    <button class="btngl" @click="selected = 75">Tambahan</button>
                    <button class="btngl" @click="selected = 150">Legasi</button>
                </div>
            </div>
        </main>
    `,
    data: () => ({
        list: [],
        editors: [],
        loading: true,
        selected: 0,
        errors: [],
        roleIconMap,
        store,
        toggledShowcase: false,
    }),
    computed: {
        level() {
            return this.list[this.selected][0];
        },
        video() {
            if (!this.level.showcase) {
                return embed(this.level.verification);
            }

            return embed(
                this.toggledShowcase
                    ? this.level.showcase
                    : this.level.verification
            );
        },
    },
    async mounted() {
        // Hide loading spinner
        this.list = await fetchList();
        this.editors = await fetchEditors();

        // Error handling
        if (!this.list) {
            this.errors = [
                "Failed to load list. Retry in a few minutes or notify list staff.",
            ];
        } else {
            this.errors.push(
                ...this.list
                    .filter(([_, err]) => err)
                    .map(([_, err]) => {
                        return `Failed to load level. (${err}.json)`;
                    })
            );
            if (!this.editors) {
                this.errors.push("Failed to load list editors.");
            }
        }

        this.loading = false;
    },
    methods: {
        embed,
        score,
    },
};
