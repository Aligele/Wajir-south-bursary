import React from "react";
import { KenyaFlag } from "../components/UI.jsx";

const SECTIONS = [
  {
    title: "1. Introduction and Geographic Setting",
    body: [
      `Wajir South lies in the far northeast of Kenya, in what is today Wajir County, close to the border with Somalia. It is a vast, arid to semi-arid plain sitting at a modest altitude — roughly 150 to 460 metres above sea level — and has historically been home to a predominantly Somali, agro-pastoralist population whose livelihood has revolved around livestock and the search for water and grazing across a fragile, drought-prone landscape. Depending on how its boundaries are drawn at any given time, Wajir South has been counted among the largest constituencies or sub-counties in the whole of Kenya, at various points measured anywhere from roughly 21,000 to nearly 23,000 square kilometres — an area larger than some entire Kenyan provinces.`,
      `To understand Wajir South today, it helps to see it as a place shaped by three overlapping histories: the deep pastoral and clan history of the communities who have lived there for generations; the disruptive arrival of colonial rule and the arbitrary borders it drew; and the long, still-unfinished struggle over political representation, resources, and boundaries that has continued from the late colonial period right through to Kenya's devolved system of government today.`,
    ],
  },
  {
    title: "2. The Land Before Colonial Rule",
    body: [
      `Long before Wajir appears in any colonial record, the region was part of a densely inhabited pastoral landscape rather than an empty frontier. Archaeological work in Wajir, Mandera, and the Chalbi Basin has uncovered prehistoric graves, pottery, and beadwork pointing to a long history of human occupation and trade connections stretching toward the Ethiopian and Somali highlands. Far from being a marginal or forgotten corner of the continent, the area supported organised, mobile societies whose seasonal movement in search of water and pasture was a deliberate ecological strategy rather than a sign of primitiveness.`,
      `By the account preserved in local memory and later repeated in official submissions, the earliest occupants of the wider Wajir area were Oromo-speaking peoples and Samburu communities, particularly around what is now Habaswein. Over succeeding generations, waves of migration brought the Ogaden, Ajuran, and Degodia communities into the area. As these groups arrived at different times and their numbers grew, they gradually displaced or absorbed the earlier occupants, and the region came to be defined by the complex, shifting relationships between these Somali clan groupings.`,
      `This was — and largely remains — an area organised not around fixed farms or towns but around mobility: communities moved with their herds according to rainfall, and access to water points (the shallow wells that gave Wajir its name) and pasture was governed by customary rules, clan agreements, and reciprocal arrangements between neighbours rather than by fixed property lines. As the population of migrants increased, however, competition over increasingly scarce resources — water and pasture above all — began to generate tension between the different communities sharing the land. It was into this setting that colonial authority arrived.`,
    ],
  },
  {
    title: "3. The Colonial Encounter: Founding of Wajir and the \u201cClosed District\u201d",
    body: [
      `Wajir was founded in 1912, when the British colonial administration established a fortified outpost, or boma, to guard the area's strategically important shallow wells and to assert control over what would become the Northern Frontier District (NFD). The choice of location was deliberate: Wajir's wells made it one of the most important water sources in an otherwise dry expanse of territory, and a garrison there allowed the colonial government to project authority across a wide area. This makes Wajir one of the older established colonial towns in Kenya, notwithstanding the later perception of the north as a peripheral, "forgotten" region.`,
      `The wider Northern Frontier District had originally covered a much larger swathe of territory, including areas later ceded to Italian-controlled Jubaland. By the late 1920s, the Northern Frontier Province covered nearly half of the colony's land area, though its population was sparse — estimated at only around 65,000 people across the whole province by 1931. Posts were established at Loiyangalani, Wajir, and Gurreh in 1912; some were later vacated, while Wajir's post endured as a key administrative centre. Bulesa briefly achieved district status with its headquarters at Garba Tula before reverting to sub-district status, and for a period the administrative headquarters for the whole Northern Frontier District were even located far away in Meru.`,
      `Critically, in 1925 the Northern Frontier — including Wajir — was designated a "closed district" under the Outlying Districts Ordinance. This meant that movement into and out of the region was tightly restricted, outsiders needed special permits to enter, and the population was administered separately from — and with markedly less investment than — the rest of colonial Kenya. From the very beginning of colonial rule, Somali pastoralist communities resisted this intrusion into their way of life and were determined to continue their nomadic activities without interference. Small-scale conflicts and at least one significant punitive expedition punctuated the 1910s and 1920s as the colonial administration sought to impose control.`,
    ],
  },
  {
    title: "4. The Second World War: Italian Occupation of Wajir",
    body: [
      `Wajir's remoteness did not spare it from the upheavals of global conflict. Following early Axis successes in Europe, Italy declared war on Britain in June 1940, and the fighting soon reached the Horn of Africa. Wajir itself was invaded and occupied by Italian forces advancing from Italian-controlled Somaliland and Ethiopia, and the town became the site of contested fighting for more than six months before British and Commonwealth forces regained control. This episode is a reminder that even Kenya's most sparsely populated frontier district was drawn directly into the currents of twentieth-century world history.`,
    ],
  },
  {
    title: "5. The 1952 Tribal Grazing Boundaries",
    body: [
      `In the years after the war, as the numbers of people and livestock in the district continued to grow, competition for water and pasture between the Ogaden, Ajuran, and Degodia communities intensified further. The colonial government's response was to formalise what had previously been more fluid, customary arrangements into fixed administrative boundaries. Under the Special Districts (Administration) Ordinance, a circular letter issued in 1952 by the then Provincial Commissioner, R. G. Turnbull, defined three separate tribal grazing areas within the wider Wajir district: Wajir South, Wajir West, and Wajir East.`,
      `The boundary of Wajir South, as set out in that 1952 circular, was described in painstaking geographic detail — beginning at the point where the Lag Kutulo crosses the Kenya–Somalia border, running northwesterly along the Lag Kutulo to where it is crossed by the El Wak–Wajir road, then southwesterly along that road to the Wajir crossroads, further southwesterly along the Wajir–Habaswein road to the Lag Bor, northwesterly up the Lag Bor to where it meets the Wajir–Merti road, southwesterly to the Hadado crossroads and on to the Habaswein Bridge, downstream along the Ewaso Ngiro until it enters the Lorian Swamp, through the swamp to where the Lag Dera leaves it, and finally southeasterly along the Lag Dera back to the Kenya–Somalia border and northward to the point of origin.`,
      `This 1952 order did more than draw a line on a map: it also created shared or "common" grazing areas between neighbouring communities, intended to accommodate seasonal and drought-driven movement. Along the Wajir South–Wajir East boundary, for instance, land south of the Bardera road was reserved for the Ogaden of Wajir South, while land further north around Gajaja formed a shared or Degodia grazing zone. Along the Wajir South–Wajir West boundary, land east of the main Wajir–Isiolo road was reserved for Wajir South's Ogaden community, while land to the west belonged to the Ajuran, with an intermediate common-use zone near Barwaqo. In times of drought, a community could formally request permission to graze temporarily on a neighbour's land — as happened in 1946, when the colonial Provincial Commissioner authorised the Wajir East community, then experiencing severe drought, to graze in parts of Wajir South and Wajir West after consultation between the three groups.`,
      `These arrangements, whatever their colonial origins, were widely credited — including by the communities themselves in later years — with having fostered a sense of belonging to specific tracts of land, encouraged sustainable management of a fragile dry-land ecosystem, and provided a structured framework for resolving disputes that helped limit open inter-clan conflict during that period.`,
    ],
  },
  {
    title: "6. Decolonisation and the Question of Secession",
    body: [
      `As Kenya moved toward independence in the early 1960s, the Northern Frontier District's future became a subject of intense and, ultimately, bitterly contested debate. In 1962, the British government appointed a commission to establish the wishes of the district's inhabitants regarding their political future. The Commission found that opinion varied by area but that across most of Mandera, Wajir, and Garissa — with the notable exception of Bantu-speaking riverine communities and the Orma — the population overwhelmingly favoured secession from Kenya at independence, with the aim of eventually joining the Somali Republic, which had itself become independent in 1960.`,
      `A delegation representing this position pressed at the Lancaster House constitutional talks for the Northern Frontier District to be granted autonomy independent of Kenya before any further constitutional changes took effect, so that it could then join the Somali Republic. Kenyan nationalist parties — KANU and KADU alike — were unanimous in rejecting any measure that would lead to the secession of any part of the NFD, and they also disputed how representative the Somali delegation truly was. In the end, despite the results of what amounted to an informal plebiscite showing strong support for union with Somalia, Britain proceeded to hand over administration of the Northern Frontier District to the new Kenyan state at independence in December 1963, rather than allow it to secede.`,
    ],
  },
  {
    title: "7. The Shifta War and Its Toll on Wajir South",
    body: [
      `The decision not to allow secession had immediate and violent consequences. Some Somali nationalists, with backing from the newly formed Somali Republic, organised a military wing — the Northern Frontier District Liberation Army — which began attacking government installations in the district in the months just before Kenyan independence. Early targets included prominent local leaders who had spoken against secession; within weeks of independence, the new Kenyan government under President Jomo Kenyatta declared a state of emergency across the province and began a sustained counter-insurgency campaign that would come to be known, from the Somali term for bandit, as the Shifta War.`,
      `The insurgency was not a single unified movement. One faction operated across a wide territory north of Wajir, drawing support from renegades based across the border in Ethiopia and counting members from the Garre, Murulle, Ajuran, and Degodia clans; a second faction operated in the area south of Wajir toward Isiolo. Units of the Kenya Rifles, drawing on personnel and institutional memory from the former King's African Rifles, were deployed to fight the insurgency, which dragged on for several years through the mid-1960s.`,
      `For the communities of Wajir South and the surrounding districts, the Shifta War meant years of military curfews, restricted movement, livestock losses, and a deepening of the very "closed district" mentality that had shaped colonial rule — except now enforced by the government of an independent Kenya. This period entrenched a pattern that would recur for decades: the north eastern region treated by the central state primarily as a security problem to be managed, rather than a community whose economic and political development deserved sustained investment. It is against this backdrop that the boundary and representation questions addressed later in Wajir South's history — including the 2010 memorandum submitted to the Interim Independent Boundary Review Commission — must be understood; they were not simply technical or administrative complaints, but part of a much longer grievance about the region's place within the Kenyan state.`,
    ],
  },
  {
    title: "8. Constituency Formation, 1958\u20131979",
    body: [
      `Even as the Shifta War raged, Kenya's new institutions of representative government were taking shape across the district, and Wajir South's constituency boundaries went through a series of changes in this period.`,
      `In 1958, the whole of the Northern Region was lumped together as a single constituency, represented by one legislator. In 1962, ahead of independence, two seats were created for the wider Wajir District: Wajir North (which included the areas that would later become Wajir North, Wajir West, and Wajir East) and Wajir South, which at that time started from Wajir Town itself, including the area of Hodhan.`,
      `The following year, 1963, brought Kenya's first national election under the new constitutional arrangements — an election that many residents of the Frontier Districts refused to participate in, reflecting the ongoing secession dispute. At around this time, the large Wajir North constituency was split into two: Wajir East and Wajir West, bringing the total number of seats in the wider district to three, including Wajir South.`,
      `In 1967, Kenya's bicameral legislature — the separate upper and lower houses inherited from the independence constitution — was merged into a single National Assembly, a change that affected the structure of representation nationwide.`,
      `Then, in 1969, following that year's general election, a further boundary review took place. Although the overall number of seats in the district stayed the same, this review divided Wajir Town itself: the areas along the Wajir–Mandera road, including Hodhan and part of the town, were assigned to Wajir East, while areas west of the Wajir–Mandera road, including Barwaqo and Jogoo, went to Wajir West. From the perspective later articulated by Wajir South's leadership, this 1969 review effectively stripped Wajir South of territory — Hodhan and Wajir Bor among it — that had historically been part of its tribal grazing land, and did so without meaningful consultation with the affected communities. This grievance would resurface repeatedly in later decades, culminating in the formal memorandum submitted to the Interim Independent Boundary Review Commission in 2010.`,
      `A further boundary map was produced in 1979 by the Electoral Commission of Kenya, continuing the pattern of periodic constituency reviews that would shape — and, from the perspective of Wajir South's leadership, repeatedly disadvantage — the area over the following decades.`,
    ],
  },
  {
    title: "9. The 1984 Wagalla Massacre",
    body: [
      `No history of Wajir South, or of Wajir more broadly, can pass over the events of February 1984, one of the darkest chapters in Kenya's post-independence history. In response to clan-related conflict and reports of arms being stockpiled by members of the Degodia clan, Kenyan security forces — drawn from the Kenya Army, the Air Force, the Police, and the Administration Police — launched what was officially described as a disarmament operation. Beginning on 10 February 1984, forces rounded up thousands of Somali men and boys from the Degodia clan — estimates of those detained range as high as 5,000 — and held them at the Wagalla airstrip, roughly nine miles from Wajir town, without adequate food or water.`,
      `Over the following days, the operation descended into mass violence. Official government figures at the time acknowledged only a small number of deaths, but survivor testimony, human rights investigations, and — decades later — Kenya's Truth, Justice and Reconciliation Commission (TJRC) documented that the true death toll ran into the hundreds and quite possibly the thousands, making Wagalla one of the worst human rights atrocities in Kenya's modern history. For years afterward, the Kenyan government maintained near-total official silence about what had happened, and journalists and advocates who tried to publicise the massacre faced harassment. It was not until 2011 — under a different political era and following the work of the TJRC — that the massacre received any form of formal government investigation.`,
      `Although Wagalla is most closely associated with Wajir town and the Degodia clan specifically, the massacre looms over the history of the entire Wajir district, including Wajir South, as a defining and still-unresolved trauma in the relationship between the region's communities and the Kenyan state — a relationship already strained by decades of "closed district" administration, the Shifta War, and disputes over boundaries and resources.`,
    ],
  },
  {
    title: "10. Continued Boundary Reviews: 1988 to 2005",
    body: [
      `The years following Wagalla saw the boundary and representation disputes that had begun with the 1969 review continue to unfold, layered now with the added weight of the massacre's legacy.`,
      `In 1988, a further review of constituency and administrative boundaries took place nationally. In most constituencies across Kenya, the "Central Division" — the zone administered directly around a district's main town — was capped at a four-kilometre radius. In Wajir South, however, this radius was extended to sixty kilometres, an anomaly that had the practical effect of forcing voters in outlying parts of the constituency to trek long distances to reach their nearest polling station, effectively diluting their access to political participation compared to residents of other Kenyan constituencies.`,
      `In 1996, another boundary review created an entirely new constituency, Wajir North, carved out of the existing Wajir West. Despite Wajir South being, by land area, the largest of the constituencies in the wider district, it was not considered for a similar split at this time — a fact that would later be cited prominently in the community's case for additional representation.`,
      `In 2001, a nationwide review of ward boundaries resulted in a drastic reduction in the number of wards within Wajir South, with large, populous locations merged together — Diif and Dadajbulla, and Sarif and Biyamathow Dilmanyale and Abakore, among others — further concentrating political representation into fewer hands relative to the area's size and population.`,
      `By 2005, the Electoral Commission of Kenya had announced its intention to conduct the boundary review mandated by law to occur every ten years, addressing constituencies, wards, and polling stations nationwide. In the lead-up to this review, some of the wards previously merged in 2001 — including Diif/Abakore/Dilmanyal and Ndege/Kibilai — were split again, though the underlying disparities in representation relative to Wajir South's vast land area remained a live grievance.`,
    ],
  },
  {
    title: "11. The 2010 Memorandum to the IIBRC",
    body: [
      `It was against this long backdrop that, on 3 May 2010, the sitting Member of Parliament for Wajir South, Hon. Abdirahman Ali Hassan, submitted a detailed memorandum to the Chairman of the Interim Independent Boundary Review Commission (IIBRC), the body tasked with reviewing Kenya's constituency, ward, and polling station boundaries ahead of the implementation of the new 2010 Constitution.`,
      `The memorandum drew explicitly on the history recounted above — the 1952 Turnbull grazing boundaries, the disruptive 1969 review that assigned Hodhan and Wajir Bor to Wajir East, the anomalous sixty-kilometre Central Division radius imposed in 1988, and the further reviews of 1996 and 2001 — to argue that Wajir South had been consistently under-represented relative to its land area and population, and that this under-representation directly translated into reduced access to Constituency Development Fund allocations, government services, and employment opportunities for its residents, particularly in the historically disputed areas of Hodhan and Wajir Bor.`,
      `The memorandum presented comparative data showing Wajir South's land area — put at 22,850 square kilometres, or roughly 3.92 percent of Kenya's entire land mass and over 40 percent of the wider Wajir district — against the much smaller areas of Wajir East, Wajir West, and Wajir North, and argued that achieving equivalent representation would require splitting Wajir South into two or three separate constituencies, along with additional administrative divisions and electoral wards. It also pointed to security challenges along the Somali border, environmental degradation linked to nearby refugee camps and overgrazing, poor infrastructure, and the constituency's rapidly growing population — then estimated at over 200,000 people — as further justification for the creation of additional constituencies, districts, and wards. The memorandum proposed specific new administrative units, including a renamed Habaswein district/constituency, a reconfigured Wajir South constituency headquartered at Leheley, and a new Benane constituency headquartered at Sabule.`,
    ],
  },
  {
    title: "12. Devolution and the Creation of Wajir County",
    body: [
      `The broader constitutional reform process of which the IIBRC's boundary review was a part culminated in the promulgation of Kenya's new Constitution in August 2010, which introduced a system of devolved county government. Kenya's 47 new counties, including Wajir County, were formally established, and the old provincial and district administrative structure — including what had been Wajir District — was dissolved.`,
      `The first elections under the new devolved system were held on 4 March 2013, when Wajir County residents elected their first county governor and county assembly alongside the national general election. Wajir District's former four constituencies — Wajir North, Wajir West, Wajir East, and Wajir South — were joined by two newly created constituencies, Eldas and Tarbaj, bringing Wajir County's total to six constituencies. Wajir County came to comprise eight sub-counties: Wajir East, Tarbaj, Wajir West, Eldas, Wajir North, Buna, Habaswein, and Wajir South.`,
      `Notably, under the new arrangement, Wajir South and Wajir North constituencies retained the largest number of electoral wards among the six constituencies — seven each, compared to four in the others — a partial, though not complete, response to the long-standing case for greater representation that Wajir South's leadership had been making since at least the 1990s and had formally pressed in the 2010 memorandum.`,
    ],
  },
  {
    title: "13. Wajir South Constituency Today",
    body: [
      `In the devolved structure, Wajir South Constituency today comprises seven wards — Burder, Dadajabula, Ibrahim Ure, Diif, Lagboqol South, Habaswein, and Banane — each electing a Member of the County Assembly to the Wajir County Assembly. Estimates place the constituency's land area at over 21,000 square kilometres, making it larger than Kenya's Central, Nairobi, and Western regions combined, and it remains among the least developed constituencies in the country relative to its size.`,
      `The grievances articulated in the 2010 memorandum have, in important respects, persisted into the devolved era in a new form. In September 2023, leaders from Wajir South, led by the constituency's then Member of Parliament, submitted a fresh memorandum — this time to the National Dialogue Committee at the Bomas of Kenya in Nairobi — proposing the creation of an entirely separate Wajir South County. The central argument echoed the logic of the 2010 submission: despite accounting for around 40 percent of Wajir County's total land area, Wajir South was said to receive only a small fraction of the county's resource allocation and county government jobs, figures cited at around 5.33 percent and 4.19 percent respectively. In other words, the transition from a centrally administered district to a devolved county government had, in the eyes of Wajir South's leadership, reproduced many of the same disparities in representation and resource-sharing that had motivated the original 2010 boundary memorandum — only now within the internal politics of Wajir County itself, rather than between the old district's separate constituencies.`,
    ],
  },
  {
    title: "14. Conclusion",
    body: [
      `The history of Wajir South is, in many ways, a history in miniature of Kenya's wider Northern Frontier: a region with deep, long-settled pastoral traditions, disrupted first by the arbitrary lines and "closed district" policies of colonial administration, then by the violence and mistrust of the Shifta War and the Wagalla massacre, and finally by a decades-long and still-unresolved argument over whether the region's political and administrative boundaries fairly reflect the size, population, and needs of the people who live within them.`,
      `From the 1952 Turnbull grazing boundaries, through the contested 1969 constituency review, to the 2010 memorandum submitted to the IIBRC and the 2023 push for a separate county, the throughline is remarkably consistent: successive generations of Wajir South's leadership and residents have argued that the area's vast size and rapid population growth entitle it to a level of political representation and resource allocation that it has, in their view, never quite received — first as a marginalised part of the colonial Northern Frontier District, then as an under-served constituency within independent Kenya's district system, and now as an underweighted sub-county within a devolved Wajir County. Whether through new constituencies, new wards, or an entirely new county, the underlying demand has remained the same: that the historical wrongs of boundary-making be reversed, and that Wajir South's people receive a political voice proportionate to the land — and the history — they hold.`,
    ],
  },
];

export default function History({ onClose }) {
  return (
    <div className="fixed inset-0 z-40 bg-sand overflow-y-auto animate-fade-up">
      <div className="sticky top-0 z-10 bg-green text-sand px-5 py-4 flex items-center justify-between border-b-[3px] border-gold">
        <div className="flex items-center gap-2.5">
          <KenyaFlag width={26} />
          <div>
            <div className="font-extrabold text-lg leading-tight">A History of Wajir South</div>
            <div className="text-xs text-[#cde0d1]">From the pre-colonial era to the present day</div>
          </div>
        </div>
        <button onClick={onClose} className="text-2xl leading-none transition-transform hover:scale-110" aria-label="Close">×</button>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-6 space-y-6">
        <div className="card">
          <p className="text-sm text-ink leading-relaxed">
            Wajir South lies in the far northeast of Kenya, a vast, arid to semi-arid plain whose
            history spans deep pastoral traditions, colonial disruption, the Shifta War and the
            Wagalla massacre, and a decades-long struggle over fair political representation —
            a struggle that continues today.
          </p>
        </div>

        {SECTIONS.map((s) => (
          <div key={s.title} className="card">
            <h2 className="text-lg font-extrabold text-green-d mb-3">{s.title}</h2>
            <div className="space-y-3">
              {s.body.map((p, i) => (
                <p key={i} className="text-sm text-ink leading-relaxed">{p}</p>
              ))}
            </div>
          </div>
        ))}

        <div className="card !bg-sand-2">
          <div className="text-[10px] uppercase tracking-wide font-bold text-ink-soft mb-2">Sources</div>
          <p className="text-xs text-ink-soft leading-relaxed">
            This history draws on the 2010 memorandum "Review of Boundaries, Wards and Polling
            Stations in Wajir South Constituency" submitted by Hon. Abdirahman Ali Hassan, MP, to
            the IIBRC, together with published historical and reference sources including
            Wikipedia entries on Wajir District, Wajir County, Wajir South Constituency, the
            Northern Frontier District, and the Wagalla massacre; historical and journalistic
            accounts from WardheerNews, The Elephant, the Peace Research Institute Oslo (PRIO),
            Ken Opalo's writing on the Wagalla massacre, and Abiri Kenya's history of Wajir; UK
            Parliamentary Hansard records on the Northern Frontier District of Kenya (1963); and
            the Wajir County Integrated Development Plan 2013–2017.
          </p>
        </div>

        <div className="flex justify-center pb-4">
          <button onClick={onClose} className="btn-ghost">← Back to the system</button>
        </div>
      </div>
    </div>
  );
}
