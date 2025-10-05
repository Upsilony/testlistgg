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
                    <p v-if="i + 1 === 1" class="type-label-lg" class="top1">#{{ i + 1 }}</p>
                    <p v-else-if="i + 1 <= 75" class="type-label-lg">#{{ i + 1 }}</p>
                    <p v-else-if="i + 1 <= 150" class="extended">#{{ i + 1 }}</p>
                    <p v-else="i + 1 > 150" class="type-label-lg" class="legacy">–</p>
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
                    <div class="packs" v-if="level.packs.length > 0">
                        <div v-for="pack in level.packs" class="tag" :style="{background:pack.colour}">
                            <p>{{pack.name}}</p>
                        </div>
                    </div>
                    <iframe class="video" :src="embed(level.verification)" frameborder="0"></iframe>
                    <ul class="stats">
                        <li v-if="selected + 1 <= 150">
                            <div class="type-title-sm">Points:</div>
                            <p v-if="selected + 1 <= 75">{{ score(selected + 1, level.percentToQualify, level.percentToQualify) }} (100% = {{ score(selected + 1, 100, level.percentToQualify) }})</p>
                            <p v-else>{{ score(selected + 1, 100, level.percentToQualify) }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">ID:</div>
                            <p class="type-label-lg">{{ level.id }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">Password:</div>
                            <p>{{ level.password || 'Free Copy' }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">Difficulty:</div>
                            <p>{{ level.difficulty || 'Demon' }}</p>
                        </li>
                    </ul>
                    <h2>Records</h2>
                    <p class="extended"><b>{{ level.records.length }}</b> records registered</p>
                    <p v-if="selected + 1 <= 75"><strong>{{ level.percentToQualify }}%</strong> or better to qualify</p>
                    <p v-else-if="selected + 1 <= 150"><strong>100%</strong> to qualify</p>
                    <p v-else>You may submit a record for this level, but no list points will be awarded.</p>
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
                    <h2>Guidelines</h2>
                    <br>
                    <p>Every action is conducted in accordance with our guidelines. In order to guarantee a consistent experience, make sure to verify them before submitting a record!</p>
                    <br><br>
                    <a class="btngl" href="/extended-page/rules.html">Guidelines Page</a>
                    <a class="btngl" href="/extended-page/faq.html">FAQ</a>
                    </div>
                    <div class="dark-bg" v-if="editors">
                    <br>
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
                    <div class="og">
                        <iframe class="discord-box" src="https://discord.com/widget?id=1287259788094214204&theme=dark" width="270" height="300" allowtransparency="false" frameborder="0" sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"></iframe>
                    </div>
                    <div class="og" class="dark-bg">
                        <p>All credit goes to <a href="https://tsl.pages.dev/#/" target="_blank">TSL</a>, whose website this is a replica of. We obtained permission from its owners and have no connection to TSL. Original List by <a href="https://me.redlimerl.com/" target="_blank">RedLime</a></p>
                    </div>
                    <button class="btngl" @click="selected = 0">#1 Demon</button>
                    <button class="btngl" @click="selected = 75">Extended</button>
                    <button class="btngl" @click="selected = 150">Legacy</button>
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
    }),
    computed: {
        level() {
            return this.list[this.selected][0];
        },
    },
    async mounted() {
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

        // Hide loading spinner
        this.loading = false;
    },
    methods: {
        embed,
        score,
    },
};
